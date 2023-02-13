using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class dataDic : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DataDictionaries",
                schema: "dep",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Label = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Value1 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Value2 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DataDictionaries", x => x.Id);
                });

            migrationBuilder.InsertData(
                schema: "dep",
                table: "Lookups",
                columns: new[] { "Id", "Name", "QueryText" },
                values: new object[,]
                {
                    { new Guid("727052ba-0033-42c9-a39c-06a103e4b021"), "Roles", "SELECT sr.RoleName, sr.Id FROM dep.SiteRoles sr ORDER BY sr.RoleName" },
                    { new Guid("e1f3e2c7-25ca-4d69-9405-abc54923864d"), "Vendors", "SELECT dd.Label, dd.Value FROM dep.DataDictionaries dd WHERE dd.Category = 'Vendor' ORDER BY dd.Label" },
                    { new Guid("704a3d00-62df-4c62-a4bd-457c4dc242ca"), "Employers", "SELECT dd.Label, dd.Value FROM dep.DataDictionaries dd WHERE dd.Category = 'Employer' ORDER BY dd.Label" }
                });

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "UniversalGridConfigurations",
                keyColumn: "Id",
                keyValue: new Guid("071f5419-85b8-11ed-a86f-0242ac130004"),
                column: "SearchConfig",
                value: "[{\"key\":\"username\",\"type\":\"input\",\"filterType\":\"text\",\"props\":{\"label\":\"CNP ID\",\"placeholder\":\"CNP ID\"},\"searchRule\":{\"field\":\"Username\",\"matchMode\":\"contains\"}},{\"key\":\"name\",\"type\":\"input\",\"filterType\":\"text\",\"props\":{\"label\":\"Name\",\"placeholder\":\"Name\"},\"searchRule\":{\"field\":\"Name\",\"matchMode\":\"contains\"}},{\"key\":\"roles\",\"type\":\"multiSelect\",\"filterType\":\"text\",\"props\":{\"label\":\"Roles\",\"placeholder\":\"Please select\",\"optionLookup\":\"727052BA-0033-42C9-A39C-06A103E4B021\"},\"searchRule\":{\"whereClause\":\"Id in (select UserId from USERID_PERMISSION where PERMISSION_GRANT_ID in ##VALUE##)\"}},{\"key\":\"vendor\",\"type\":\"multiSelect\",\"filterType\":\"text\",\"props\":{\"label\":\"Vendor\",\"placeholder\":\"Please select\",\"optionLookup\":\"E1F3E2C7-25CA-4D69-9405-ABC54923864D\"},\"searchRule\":{\"field\":\"Vendor\",\"matchMode\":\"in\"}},{\"key\":\"employer\",\"type\":\"multiSelect\",\"filterType\":\"text\",\"props\":{\"label\":\"Employer\",\"placeholder\":\"Please select\",\"optionLookup\":\"704A3D00-62DF-4C62-A4BD-457C4DC242CA\"},\"searchRule\":{\"field\":\"Employer\",\"matchMode\":\"in\"}}]");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DataDictionaries",
                schema: "dep");

            migrationBuilder.DeleteData(
                schema: "dep",
                table: "Lookups",
                keyColumn: "Id",
                keyValue: new Guid("704a3d00-62df-4c62-a4bd-457c4dc242ca"));

            migrationBuilder.DeleteData(
                schema: "dep",
                table: "Lookups",
                keyColumn: "Id",
                keyValue: new Guid("727052ba-0033-42c9-a39c-06a103e4b021"));

            migrationBuilder.DeleteData(
                schema: "dep",
                table: "Lookups",
                keyColumn: "Id",
                keyValue: new Guid("e1f3e2c7-25ca-4d69-9405-abc54923864d"));

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "UniversalGridConfigurations",
                keyColumn: "Id",
                keyValue: new Guid("071f5419-85b8-11ed-a86f-0242ac130004"),
                column: "SearchConfig",
                value: "[{\"key\":\"username\",\"type\":\"input\",\"filterType\":\"text\",\"props\":{\"label\":\"CNP ID\",\"placeholder\":\"CNP ID\"},\"searchRule\":{\"field\":\"Username\",\"matchMode\":\"contains\"}},{\"key\":\"name\",\"type\":\"input\",\"filterType\":\"text\",\"props\":{\"label\":\"Name\",\"placeholder\":\"Name\"},\"searchRule\":{\"field\":\"Name\",\"matchMode\":\"contains\"}},{\"key\":\"roles\",\"type\":\"select\",\"filterType\":\"text\",\"props\":{\"label\":\"Roles\",\"placeholder\":\"Please select\",\"options\":[{\"value\":1,\"label\":\"Option 1\"},{\"value\":2,\"label\":\"Option 2\"},{\"value\":3,\"label\":\"Option 3\"},{\"value\":4,\"label\":\"Option 4\"}]},\"searchRule\":{\"whereClause\":\"Id in (select UserId from USERID_PERMISSION where PERMISSION_GRANT_ID = \\u0027{0}\\u0027)\"}},{\"key\":\"vendor\",\"type\":\"select\",\"filterType\":\"text\",\"props\":{\"label\":\"Vendor\",\"placeholder\":\"Please select\",\"options\":[{\"value\":1,\"label\":\"Option 1\"},{\"value\":2,\"label\":\"Option 2\"},{\"value\":3,\"label\":\"Option 3\"},{\"value\":4,\"label\":\"Option 4\"}]},\"searchRule\":{\"field\":\"Vendor\",\"matchMode\":\"contains\"}},{\"key\":\"employer\",\"type\":\"select\",\"filterType\":\"text\",\"props\":{\"label\":\"Employer\",\"placeholder\":\"Please select\",\"options\":[{\"value\":1,\"label\":\"Option 1\"},{\"value\":2,\"label\":\"Option 2\"},{\"value\":3,\"label\":\"Option 3\"},{\"value\":4,\"label\":\"Option 4\"}]},\"searchRule\":{\"field\":\"Employer\",\"matchMode\":\"contains\"}}]");
        }
    }
}
