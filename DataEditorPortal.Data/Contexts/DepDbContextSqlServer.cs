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

            modelBuilder.Entity<DEP_USER>().ToTable("DEP_USERS", "DEP");
        }
    }
}
