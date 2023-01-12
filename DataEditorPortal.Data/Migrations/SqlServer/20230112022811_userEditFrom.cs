using Microsoft.EntityFrameworkCore.Migrations;
using System;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class userEditFrom : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "dep",
                table: "UniversalGridConfigurations",
                keyColumn: "Id",
                keyValue: new Guid("071f5419-85b8-11ed-a86f-0242ac130004"),
                column: "DetailConfig",
                value: "{\"UseCustomAction\":false,\"FormConfig\":[{\"key\":\"Username\",\"type\":\"input\",\"props\":{\"label\":\"CNP ID\",\"placeholder\":\"CNP ID\",\"required\":true}},{\"key\":\"Name\",\"type\":\"input\",\"props\":{\"label\":\"Name\",\"placeholder\":\"Name\",\"required\":true}},{\"key\":\"Email\",\"type\":\"input\",\"props\":{\"label\":\"Email\",\"placeholder\":\"Email\",\"required\":true}},{\"key\":\"Phone\",\"type\":\"input\",\"props\":{\"label\":\"Phone\",\"placeholder\":\"Phone\",\"required\":true}},{\"key\":\"Vendor\",\"type\":\"input\",\"props\":{\"label\":\"Vendor\",\"placeholder\":\"Vendor\"}},{\"key\":\"Employer\",\"type\":\"input\",\"props\":{\"label\":\"Employer\",\"placeholder\":\"Employer\"}},{\"key\":\"AutoEmail\",\"type\":\"checkbox\",\"props\":{\"label\":\"Auto Email\",\"required\":true}}]}");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "dep",
                table: "UniversalGridConfigurations",
                keyColumn: "Id",
                keyValue: new Guid("071f5419-85b8-11ed-a86f-0242ac130004"),
                column: "DetailConfig",
                value: "{\"UseCustomAction\":false,\"FormConfig\":[{\"key\":\"Username\",\"type\":\"input\",\"props\":{\"label\":\"CNP ID\",\"placeholder\":\"CNP ID\",\"required\":true}},{\"key\":\"Name\",\"type\":\"input\",\"props\":{\"label\":\"Name\",\"placeholder\":\"Name\",\"required\":true}},{\"key\":\"Email\",\"type\":\"input\",\"props\":{\"label\":\"Email\",\"placeholder\":\"Email\",\"required\":true}},{\"key\":\"Phone\",\"type\":\"input\",\"props\":{\"label\":\"Phone\",\"placeholder\":\"Phone\",\"required\":true}},{\"key\":\"Vendor\",\"type\":\"input\",\"props\":{\"label\":\"Vendor\",\"placeholder\":\"Vendor\"}},{\"key\":\"Employer\",\"type\":\"input\",\"props\":{\"label\":\"Employer\",\"placeholder\":\"Employer\"}}]}");
        }
    }
}
