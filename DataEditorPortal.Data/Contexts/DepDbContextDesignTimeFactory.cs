using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace DataEditorPortal.Data.Contexts
{
    // Add-Migration InitialCreate -Context DepDbContextSqlServer -OutputDir Migrations\SqlServer -StartupProject "DataEditorPortal.Data" -Project "DataEditorPortal.Data"
    // Remove-Migration -Context DepDbContextSqlServer -StartupProject "DataEditorPortal.Data" -Project "DataEditorPortal.Data"
    // Update-Database -Context DepDbContextSqlServer -StartupProject "DataEditorPortal.Data" -Project "DataEditorPortal.Data"
    // 
    // *****IMPORTANT*****:
    // Remember to replace the schema literal string in the genrated migrations to Common.Constants.DEFAULT_SCHEMA, schema will be set at runtime.
    // 
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

    // Add-Migration InitialCreate -Context DepDbContextOracle -OutputDir Migrations\Oracle -StartupProject "DataEditorPortal.Data" -Project "DataEditorPortal.Data"
    // Remove-Migration -Context DepDbContextOracle -StartupProject "DataEditorPortal.Data" -Project "DataEditorPortal.Data"
    // Update-Database -Context DepDbContextOracle -StartupProject "DataEditorPortal.Data" -Project "DataEditorPortal.Data"
    // 
    // *****IMPORTANT*****:
    // Remember to replace the schema literal string in the genrated migrations to Common.Constants.DEFAULT_SCHEMA, schema will be set at runtime.
    // 
    public class DepDbContextOracleDesignTimeFactory : IDesignTimeDbContextFactory<DepDbContextOracle>
    {
        public DepDbContextOracle CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<DepDbContext>();
            var connection = @"Data Source=(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=192.168.1.246)(PORT=1521))(CONNECT_DATA=(SERVICE_NAME=dep.lan)));User ID=system;Password=123456";
            optionsBuilder.UseOracle(connection, b => b.UseOracleSQLCompatibility("11"));

            return new DepDbContextOracle(optionsBuilder.Options);
        }
    }
}