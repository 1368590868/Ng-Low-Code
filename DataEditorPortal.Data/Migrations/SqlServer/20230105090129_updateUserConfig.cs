﻿using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class updateUserConfig : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "dep",
                table: "UniversalGridConfigurations",
                keyColumn: "Id",
                keyValue: new Guid("071f5419-85b8-11ed-a86f-0242ac130004"),
                columns: new[] { "CreatedDate", "SearchConfig" },
                values: new object[] { new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "[{\"key\":\"username\",\"type\":\"input\",\"props\":{\"label\":\"CNP ID\",\"placeholder\":\"CNP ID\"},\"searchRule\":{\"field\":\"Username\",\"matchMode\":\"contains\"}},{\"key\":\"name\",\"type\":\"input\",\"props\":{\"label\":\"Name\",\"placeholder\":\"Name\"},\"searchRule\":{\"field\":\"Name\",\"matchMode\":\"contains\"}},{\"key\":\"roles\",\"type\":\"select\",\"props\":{\"label\":\"Roles\",\"placeholder\":\"Please select\",\"options\":[{\"value\":1,\"label\":\"Option 1\"},{\"value\":2,\"label\":\"Option 2\"},{\"value\":3,\"label\":\"Option 3\"},{\"value\":4,\"label\":\"Option 4\"}]},\"searchRule\":{\"whereClause\":\"Id in (select UserId from USERID_PERMISSION where PERMISSION_GRANT_ID = '{0}')\"}},{\"key\":\"vendor\",\"type\":\"select\",\"props\":{\"label\":\"Vendor\",\"placeholder\":\"Please select\",\"options\":[{\"value\":1,\"label\":\"Option 1\"},{\"value\":2,\"label\":\"Option 2\"},{\"value\":3,\"label\":\"Option 3\"},{\"value\":4,\"label\":\"Option 4\"}]},\"searchRule\":{\"field\":\"Vendor\",\"matchMode\":\"contains\"}},{\"key\":\"employer\",\"type\":\"select\",\"props\":{\"label\":\"Employer\",\"placeholder\":\"Please select\",\"options\":[{\"value\":1,\"label\":\"Option 1\"},{\"value\":2,\"label\":\"Option 2\"},{\"value\":3,\"label\":\"Option 3\"},{\"value\":4,\"label\":\"Option 4\"}]},\"searchRule\":{\"field\":\"Employer\",\"matchMode\":\"contains\"}}]" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "dep",
                table: "UniversalGridConfigurations",
                keyColumn: "Id",
                keyValue: new Guid("071f5419-85b8-11ed-a86f-0242ac130004"),
                columns: new[] { "CreatedDate", "SearchConfig" },
                values: new object[] { new DateTime(2022, 12, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), "[{\"Name\":\"Username\",\"Label\":\"CNP ID\",\"Type\":\"pInputText\"},{\"Name\":\"NAME\",\"Label\":\"Name\",\"Type\":\"pInputText\"}]" });
        }
    }
}
