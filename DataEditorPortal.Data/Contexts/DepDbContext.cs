using DataEditorPortal.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace DataEditorPortal.Data.Contexts
{
    public class DepDbContext : DbContext
    {
        public DepDbContext(DbContextOptions<DepDbContext> options) : base(options)
        {
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
    }
}
