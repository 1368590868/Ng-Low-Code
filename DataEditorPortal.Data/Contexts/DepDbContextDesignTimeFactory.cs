using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace DataEditorPortal.Data.Contexts
{
    // Add-Migration InitialCreate -Context DepDbContextSqlServer -OutputDir Migrations\SqlServer -StartupProject "DataEditorPortal.Data" -Project "DataEditorPortal.Data"
    // Remove-Migration -Context DepDbContextSqlServer -StartupProject "DataEditorPortal.Data" -Project "DataEditorPortal.Data"
    // Update-Database -Context DepDbContextSqlServer -StartupProject "DataEditorPortal.Data" -Project "DataEditorPortal.Data"
    public class DepDbContextSqlServerDesignTimeFactory : IDesignTimeDbContextFactory<DepDbContextSqlServer>
    {
        public DepDbContextSqlServer CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<DepDbContext>();
            var connection = @"Data Source=192.168.1.241;Initial Catalog=DataEditorPortal;Uid=sa;Pwd=123456;MultipleActiveResultSets=true;Enlist=true;Pooling=true;Max Pool Size=1024;Min Pool Size=0;";
            optionsBuilder.UseSqlServer(connection);

            return new DepDbContextSqlServer(optionsBuilder.Options);
        }
    }
}