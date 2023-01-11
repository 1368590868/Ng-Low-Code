using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class updateUserConfig2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UseCustomDetailDialog",
                schema: "dep",
                table: "UniversalGridConfigurations");

            migrationBuilder.RenameColumn(
                name: "DetailDialogConfig",
                schema: "dep",
                table: "UniversalGridConfigurations",
                newName: "DetailConfig");

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "UniversalGridConfigurations",
                keyColumn: "Id",
                keyValue: new Guid("071f5419-85b8-11ed-a86f-0242ac130004"),
                column: "DetailConfig",
                value: "{\"UseCustomAction\":false,\"FormConfig\":[{\"key\":\"Username\",\"type\":\"input\",\"props\":{\"label\":\"CNP ID\",\"placeholder\":\"CNP ID\",\"required\":true}},{\"key\":\"Name\",\"type\":\"input\",\"props\":{\"label\":\"Name\",\"placeholder\":\"Name\",\"required\":true}},{\"key\":\"Email\",\"type\":\"input\",\"props\":{\"label\":\"Email\",\"placeholder\":\"Email\",\"required\":true}},{\"key\":\"Phone\",\"type\":\"input\",\"props\":{\"label\":\"Phone\",\"placeholder\":\"Phone\",\"required\":true}},{\"key\":\"Vendor\",\"type\":\"input\",\"props\":{\"label\":\"Vendor\",\"placeholder\":\"Vendor\"}},{\"key\":\"Employer\",\"type\":\"input\",\"props\":{\"label\":\"Employer\",\"placeholder\":\"Employer\"}}]}");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DetailConfig",
                schema: "dep",
                table: "UniversalGridConfigurations",
                newName: "DetailDialogConfig");

            migrationBuilder.AddColumn<bool>(
                name: "UseCustomDetailDialog",
                schema: "dep",
                table: "UniversalGridConfigurations",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "UniversalGridConfigurations",
                keyColumn: "Id",
                keyValue: new Guid("071f5419-85b8-11ed-a86f-0242ac130004"),
                column: "DetailDialogConfig",
                value: null);
        }
    }
}
