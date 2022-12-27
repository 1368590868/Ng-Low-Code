using DataEditorPortal.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace DataEditorPortal.Data.Contexts
{
    public class DepDbContext : DbContext
    {
        public DepDbContext(DbContextOptions<DepDbContext> options) : base(options)
        {
        }

        public virtual DbSet<User> Users { get; set; }
        public virtual DbSet<UserPermission> UserPermissions { get; set; }
        public virtual DbSet<SiteRole> SiteRoles { get; set; }
        public virtual DbSet<SitePermission> SitePermissions { get; set; }
        public virtual DbSet<SitePermissionRole> SitePermissionRoles { get; set; }

        public virtual DbSet<UniversalGridConfiguration> UniversalGridConfigurations { get; set; }
    }
}
