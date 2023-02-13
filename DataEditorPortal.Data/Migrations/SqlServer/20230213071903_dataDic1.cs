using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class dataDic1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "dep",
                table: "UniversalGridConfigurations",
                keyColumn: "Id",
                keyValue: new Guid("071f5419-85b8-11ed-a86f-0242ac130004"),
                column: "SearchConfig",
                value: "[{\"key\":\"username\",\"type\":\"input\",\"filterType\":\"text\",\"props\":{\"label\":\"CNP ID\",\"placeholder\":\"CNP ID\"},\"searchRule\":{\"field\":\"Username\",\"matchMode\":\"contains\"}},{\"key\":\"name\",\"type\":\"input\",\"filterType\":\"text\",\"props\":{\"label\":\"Name\",\"placeholder\":\"Name\"},\"searchRule\":{\"field\":\"Name\",\"matchMode\":\"contains\"}},{\"key\":\"roles\",\"type\":\"multiSelect\",\"filterType\":\"text\",\"props\":{\"label\":\"Roles\",\"placeholder\":\"Please select\",\"optionLookup\":\"727052BA-0033-42C9-A39C-06A103E4B021\"},\"searchRule\":{\"whereClause\":\"Id in (select UserId from dep.UserPermissions where PermissionGrantId in (##VALUE##))\"}},{\"key\":\"vendor\",\"type\":\"multiSelect\",\"filterType\":\"text\",\"props\":{\"label\":\"Vendor\",\"placeholder\":\"Please select\",\"optionLookup\":\"E1F3E2C7-25CA-4D69-9405-ABC54923864D\"},\"searchRule\":{\"field\":\"Vendor\",\"matchMode\":\"in\"}},{\"key\":\"employer\",\"type\":\"multiSelect\",\"filterType\":\"text\",\"props\":{\"label\":\"Employer\",\"placeholder\":\"Please select\",\"optionLookup\":\"704A3D00-62DF-4C62-A4BD-457C4DC242CA\"},\"searchRule\":{\"field\":\"Employer\",\"matchMode\":\"in\"}}]");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "dep",
                table: "UniversalGridConfigurations",
                keyColumn: "Id",
                keyValue: new Guid("071f5419-85b8-11ed-a86f-0242ac130004"),
                column: "SearchConfig",
                value: "[{\"key\":\"username\",\"type\":\"input\",\"filterType\":\"text\",\"props\":{\"label\":\"CNP ID\",\"placeholder\":\"CNP ID\"},\"searchRule\":{\"field\":\"Username\",\"matchMode\":\"contains\"}},{\"key\":\"name\",\"type\":\"input\",\"filterType\":\"text\",\"props\":{\"label\":\"Name\",\"placeholder\":\"Name\"},\"searchRule\":{\"field\":\"Name\",\"matchMode\":\"contains\"}},{\"key\":\"roles\",\"type\":\"multiSelect\",\"filterType\":\"text\",\"props\":{\"label\":\"Roles\",\"placeholder\":\"Please select\",\"optionLookup\":\"727052BA-0033-42C9-A39C-06A103E4B021\"},\"searchRule\":{\"whereClause\":\"Id in (select UserId from USERID_PERMISSION where PERMISSION_GRANT_ID in ##VALUE##)\"}},{\"key\":\"vendor\",\"type\":\"multiSelect\",\"filterType\":\"text\",\"props\":{\"label\":\"Vendor\",\"placeholder\":\"Please select\",\"optionLookup\":\"E1F3E2C7-25CA-4D69-9405-ABC54923864D\"},\"searchRule\":{\"field\":\"Vendor\",\"matchMode\":\"in\"}},{\"key\":\"employer\",\"type\":\"multiSelect\",\"filterType\":\"text\",\"props\":{\"label\":\"Employer\",\"placeholder\":\"Please select\",\"optionLookup\":\"704A3D00-62DF-4C62-A4BD-457C4DC242CA\"},\"searchRule\":{\"field\":\"Employer\",\"matchMode\":\"in\"}}]");
        }
    }
}
