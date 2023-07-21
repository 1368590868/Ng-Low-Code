using DataEditorPortal.Data.Common;
using DataEditorPortal.Data.Models;
using Microsoft.EntityFrameworkCore;
using System;

namespace DataEditorPortal.Data.Contexts
{
    public class DepDbContext : DbContext
    {
        private readonly IUtcLocalConverter _utcLocalConverter;
        public DepDbContext(DbContextOptions<DepDbContext> options, IUtcLocalConverter utcLocalConverter) : base(options)
        {
            _utcLocalConverter = utcLocalConverter;
        }

        public virtual DbSet<SiteSetting> SiteSettings { get; set; }
        public virtual DbSet<SiteContent> SiteContents { get; set; }

        public virtual DbSet<User> Users { get; set; }
        public virtual DbSet<UserPermission> UserPermissions { get; set; }
        public virtual DbSet<SiteRole> SiteRoles { get; set; }
        public virtual DbSet<SitePermission> SitePermissions { get; set; }
        public virtual DbSet<SiteRolePermission> SiteRolePermissions { get; set; }

        public virtual DbSet<SiteMenu> SiteMenus { get; set; }
        public virtual DbSet<Lookup> Lookups { get; set; }
        public virtual DbSet<DataDictionary> DataDictionaries { get; set; }
        public virtual DbSet<DataSourceConnection> DataSourceConnections { get; set; }
        public virtual DbSet<EventLog> EventLogs { get; set; }
        public virtual DbSet<UploadedFile> UploadedFiles { get; set; }

        public virtual DbSet<UniversalGridConfiguration> UniversalGridConfigurations { get; set; }
        public virtual DbSet<DataImportHistory> DataImportHistories { get; set; }

        public virtual DbSet<DemoTable> DemoTables { get; set; }

        // LPA Demo
        public virtual DbSet<LPASITE> LPASITE { get; set; }
        public virtual DbSet<LPAREMEDIATIONACTSITE> LPAREMEDIATIONACTSITE { get; set; }
        public virtual DbSet<LPASITE_RELATION> LPASITE_RELATION { get; set; }
        public virtual DbSet<GFORM_SITE_HIERARCHY_MV> GFORM_SITE_HIERARCHY_MV { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                if (entityType.IsKeyless)
                {
                    continue;
                }

                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(DateTime))
                    {
                        property.SetValueConverter(_utcLocalConverter.Converter);
                    }
                    else if (property.ClrType == typeof(DateTime?))
                    {
                        property.SetValueConverter(_utcLocalConverter.NullableConverter);
                    }
                }
            }
        }
    }
}
