using AutoWrapper;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Services;
using Microsoft.AspNetCore.Authentication.Negotiate;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
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
            services.AddScoped(sp =>
            {
                var databaseProvider = Configuration.GetValue<string>("DatabaseProvider");
                if (databaseProvider == "SqlConnection")
                    return new DbContextOptionsBuilder<DepDbContext>()
                    .UseSqlServer(Configuration.GetConnectionString("Default"), b =>
                    {
                        b.CommandTimeout(300);
                        b.MigrationsHistoryTable(HistoryRepository.DefaultTableName, "dep");
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
                else
                    throw new NotImplementedException();
            });
            services.AddTransient<DbConnection>(sp =>
            {
                var databaseProvider = Configuration.GetValue<string>("DatabaseProvider");
                if (databaseProvider == "SqlConnection")
                    return new SqlConnection(Configuration.GetConnectionString("Default"));
                else
                    throw new NotImplementedException();
            });
            #endregion

            services.AddScoped<DbSqlServerBuilder>();
            services.AddScoped<IDbSqlBuilder>(sp =>
            {
                var databaseProvider = Configuration.GetValue<string>("DatabaseProvider");
                if (databaseProvider == "SqlConnection")
                    return sp.GetService<DbSqlServerBuilder>();
                else
                    throw new NotImplementedException();
            });

            services.AddScoped<IUniversalGridService, UniversalGridService>();
            services.AddScoped<IPortalItemService, PortalItemService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IPermissionService, PermissionService>();

            #endregion

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

            services.AddControllersWithViews().AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new IsoDateTimeConverter());
            });

            // In production, the Angular files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/dist";
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILoggerFactory loggerFactory)
        {
            using (var scope = app.ApplicationServices.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetService<DepDbContext>();
                dbContext.Database.Migrate();

                dbContext.SetDefaultDataSourceConnection();
                foreach (var con in Configuration.GetSection("ConnectionStrings").GetChildren())
                {
                    dbContext.AddClientDataSourceConnection(con.Key, con.Value);
                }
            }

            // Enable Log files
            loggerFactory.AddFile(Configuration.GetSection("Logging"));

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
            app.UseSpaStaticFiles();

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
