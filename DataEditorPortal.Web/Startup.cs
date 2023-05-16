using AutoWrapper;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Common.Install;
using DataEditorPortal.Web.Common.License;
using DataEditorPortal.Web.Services;
using Microsoft.AspNetCore.Authentication.Negotiate;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Oracle.ManagedDataAccess.Client;
using Quartz;
using System;
using System.Data.Common;

namespace DataEditorPortal.Web
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            #region Dependency Injection
            services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();

            #region DbContext and DbConnection
            services.AddTransient<DepDbContextSqlServer>();
            services.AddTransient<DepDbContextOracle>();
            services.AddScoped(sp =>
            {
                var databaseProvider = Configuration.GetValue<string>("DatabaseProvider");
                if (databaseProvider == "SqlConnection")
                    return new DbContextOptionsBuilder<DepDbContext>()
                    .UseSqlServer(Configuration.GetConnectionString("Default"), b =>
                    {
                        b.CommandTimeout(300);
                        b.MigrationsHistoryTable(HistoryRepository.DefaultTableName, Data.Common.Constants.DEFAULT_SCHEMA);
                    })
                    .Options;
                else if (databaseProvider == "Oracle")
                    return new DbContextOptionsBuilder<DepDbContext>()
                    .UseOracle(Configuration.GetConnectionString("Default"), b =>
                    {
                        b.UseOracleSQLCompatibility("11");
                        b.CommandTimeout(300);
                        b.MigrationsHistoryTable(HistoryRepository.DefaultTableName, Data.Common.Constants.DEFAULT_SCHEMA);
                    })
                    .Options;
                else
                    throw new NotImplementedException();
            });
            services.AddTransient<DepDbContext>(sp =>
            {
                var databaseProvider = Configuration.GetValue<string>("DatabaseProvider");
                if (databaseProvider == "SqlConnection")
                    return sp.GetService<DepDbContextSqlServer>();
                else if (databaseProvider == "Oracle")
                    return sp.GetService<DepDbContextOracle>();
                else
                    throw new NotImplementedException();
            });
            services.AddTransient<DbConnection>(sp =>
            {
                var databaseProvider = Configuration.GetValue<string>("DatabaseProvider");
                if (databaseProvider == "SqlConnection")
                    return new SqlConnection(Configuration.GetConnectionString("Default"));
                else if (databaseProvider == "Oracle")
                    return new OracleConnection(Configuration.GetConnectionString("Default"));
                else
                    throw new NotImplementedException();
            });
            #endregion

            services.AddScoped<ISeedDataCreator, SeedDataCreator>();
            services.AddScoped<SqlServerQueryBuilder>();
            services.AddScoped<OracleQueryBuilder>();
            services.AddScoped<IQueryBuilder>(sp =>
            {
                var databaseProvider = Configuration.GetValue<string>("DatabaseProvider");
                if (databaseProvider == "SqlConnection")
                    return sp.GetService<SqlServerQueryBuilder>();
                else if (databaseProvider == "Oracle")
                    return sp.GetService<OracleQueryBuilder>();
                else
                    throw new NotImplementedException();
            });

            services.AddScoped<IUniversalGridService, UniversalGridService>();
            services.AddScoped<IPortalItemService, PortalItemService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IPermissionService, PermissionService>();
            services.AddScoped<IEventLogService, EventLogService>();
            services.AddSingleton<ILicenseService, LicenseService>();
            services.AddScoped<IAttachmentService, AttachmentService>();
            services.AddScoped<IImportDataServcie, ImportDataService>();
            services.AddScoped<ILookupService, LookupService>();
            #endregion

            services.AddMemoryCache();
            services.AddCors(options =>
            {
                options.AddDefaultPolicy(builder =>
                {
                    builder
                        .WithOrigins("http://localhost:4200")
                        .SetIsOriginAllowed(origin => true)
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });
            });

            services.AddAuthentication(NegotiateDefaults.AuthenticationScheme).AddNegotiate();

            services.AddAutoMapper(typeof(Startup));

            services.AddControllersWithViews(configure =>
            {
                configure.Filters.Add<LicenseActionFilter>();
            })
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new IsoDateTimeConverter());
            });

            // In production, the Angular files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/dist";
            });

            services.AddQuartz(q => { q.UseMicrosoftDependencyInjectionJobFactory(); });
            services.AddQuartzServer(options => { options.WaitForJobsToComplete = true; });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILoggerFactory loggerFactory)
        {
            // Enable Log files
            loggerFactory.AddFile(Configuration.GetSection("Logging"));

            using (var scope = app.ApplicationServices.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetService<DepDbContext>();
                dbContext.Database.Migrate();

                var seedDataCreator = scope.ServiceProvider.GetService<ISeedDataCreator>();
                if (!seedDataCreator.IsInstalled())
                {
                    seedDataCreator.Create();
                }
            }

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            //app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseSpaStaticFiles(new StaticFileOptions() { HttpsCompression = HttpsCompressionMode.Compress });

            app.UseApiResponseAndExceptionWrapper(new AutoWrapperOptions()
            {
                BypassHTMLValidation = true,
                IsApiOnly = false,
                WrapWhenApiPathStartsWith = "/api",
                ExcludePaths = new AutoWrapperExcludePath[]
                {
                    new AutoWrapperExcludePath("/")
                }
            });

            app.UseRouting();

            if (env.IsDevelopment())
            {
                app.UseCors();
            }

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller}/{action=Index}/{id?}");
            });

            app.UseSpa(spa =>
            {
                // To learn more about options for serving an Angular SPA from ASP.NET Core,
                // see https://go.microsoft.com/fwlink/?linkid=864501

                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    // spa.UseAngularCliServer(npmScript: "start");
                }
            });
        }
    }
}
