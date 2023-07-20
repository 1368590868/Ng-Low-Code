using DataEditorPortal.Data.Common;
using DataEditorPortal.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace DataEditorPortal.Data.Contexts
{
    public class DepDbContextSqlServer : DepDbContext
    {
        public DepDbContextSqlServer(DbContextOptions<DepDbContext> options, IUtcLocalConverter utcLocalConverter) : base(options, utcLocalConverter)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.HasDefaultSchema(Constants.DEFAULT_SCHEMA);

            modelBuilder.Entity<User>(entity =>
            {
                entity.Property(e => e.Id).HasDefaultValueSql("NEWID()");
                SqlServerPropertyBuilderExtensions.UseIdentityColumn(entity.Property(e => e.UserId));
            });

            modelBuilder.Entity<DemoTable>(entity =>
            {
                entity.Property(e => e.Id).HasDefaultValueSql("NEWID()");
            });
        }
    }
}
