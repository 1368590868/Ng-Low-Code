using Cuture.AspNetCore.ResponseAutoWrapper;
using DataEditorPortal.Data.Common;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Common.Install;
using DataEditorPortal.Web.Common.Json;
using DataEditorPortal.Web.Common.License;
using DataEditorPortal.Web.Common.ResponseAutoWrapper;
using DataEditorPortal.Web.Jobs;
using DataEditorPortal.Web.Services;
using DataEditorPortal.Web.Services.FieldImporter;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.Negotiate;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Identity.Web;
using Microsoft.SqlServer.Types;
using Oracle.ManagedDataAccess.Client;
using Quartz;
using System;
using System.Data;
using System.Text.Json.Serialization;

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

            // set default schema from configuration file. This will be used in all Migrations and SeedDataCreator
            Data.Common.Constants.DEFAULT_SCHEMA = Configuration.GetValue<string>("DefaultSchema");

            services.AddScoped<DepDbContextSqlServer>();
            services.AddScoped<DepDbContextOracle>();
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
            services.AddTransient<IDbConnection>(sp =>
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
            services.AddSingleton<IUtcLocalConverter, UtcLocalConverter>();

            services.AddTransient<IClaimsTransformation, DepUserClaimsTransformation>();
            services.AddScoped<ICurrentUserAccessor, CurrentUserAccessor>();
            services.AddScoped<IUniversalGridService, UniversalGridService>();
            services.AddScoped<IPortalItemService, PortalItemService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IPermissionService, PermissionService>();
            services.AddScoped<IEventLogService, EventLogService>();
            services.AddSingleton<ILicenseService, LicenseService>();
            services.AddScoped<IAttachmentService, AttachmentService>();
            services.AddScoped<IImportDataServcie, ImportDataService>();
            services.AddScoped<ILookupService, LookupService>();
            services.AddScoped<IDapperService, DapperService>();
            services.AddScoped<IDataUpdateHistoryService, DataUpdateHistoryService>();

            services.AddValueProcessors();
            services.AddFieldImporters();

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

            var authentication = Configuration.GetValue<string>("Authentication", "Windows");
            if (authentication == "Windows")
            {
                services.AddAuthentication(NegotiateDefaults.AuthenticationScheme).AddNegotiate();
            }
            else if (authentication == "AzureAd")
            {
                services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddMicrosoftIdentityWebApi(Configuration);
            }

            services.AddAutoMapper(typeof(Startup));
            services.AddResponseAutoWrapper(options =>
            {
                options.HandleAuthorizationResult = true;
                options.RewriteStatusCode = null;
            })
            .ConfigureWrappers(builder =>
            {
                builder.AddWrapper<DepExceptionWrapper, IExceptionWrapper<GenericApiResponse<int, string, object>, int, string>>();
                builder.AddWrapper<DepNotOKStatusCodeWrapper, INotOKStatusCodeWrapper<GenericApiResponse<int, string, object>, int, string>>();
                builder.AddWrapper<DepInvalidModelStateWrapper, IInvalidModelStateWrapper<GenericApiResponse<int, string, object>, int, string>>();
            });

            services.AddControllersWithViews(configure =>
            {
                configure.ModelBinderProviders.Insert(0, new HexStringGuidBinderProvider());
                configure.Filters.Add<LicenseActionFilter>();
            })
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new HexStringGuidConverter());
                options.JsonSerializerOptions.Converters.Add(new IsoDateTimeConverter());
                options.JsonSerializerOptions.Converters.Add(new SqlGeometryConverter());
                options.JsonSerializerOptions.Converters.Add(new SqlGeographyConverter());
                options.JsonSerializerOptions.Converters.Add(new SqlHierarchyIdConverter());
                options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
                options.JsonSerializerOptions.WriteIndented = false;
            });

            // In production, the Angular files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/dist";
            });

            services.AddResponseCompression(options => { options.EnableForHttps = true; });

            services.AddQuartz(q =>
            {
                q.ScheduleJob<ClearTempFileJob>(trigger => trigger
                    .WithIdentity("ClearTempFileJob")
                    .StartAt(DateBuilder.EvenMinuteDateAfterNow())
                    //.WithSimpleSchedule(x => x.WithIntervalInMinutes(1).RepeatForever())
                    .WithDailyTimeIntervalSchedule(x => x.StartingDailyAt(new TimeOfDay(0, 0)).InTimeZone(TimeZoneInfo.Utc).EndingDailyAfterCount(1))
                    .WithDescription("ClearTempFileJob"));
            });
            services.AddQuartzHostedService(options => { options.WaitForJobsToComplete = true; });

            MicrosoftSqlServerTypesAssemblyResolver.Resolve();
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

            app.UseRouting();

            if (env.IsDevelopment())
            {
                app.UseCors();
            }

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseResponseAutoWrapper();

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
