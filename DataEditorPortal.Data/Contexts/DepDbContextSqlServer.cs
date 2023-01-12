using DataEditorPortal.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace DataEditorPortal.Data.Contexts
{
    public class DepDbContextSqlServer : DepDbContext
    {
        public DepDbContextSqlServer(DbContextOptions<DepDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.HasDefaultSchema("dep");

            modelBuilder.Entity<User>(entity =>
            {
                entity.Property(e => e.Id).HasDefaultValueSql("NEWID()");
            });
        }
    }
}
