using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class siteMenus1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                schema: "dep",
                table: "UniversalGridConfigurations");

            migrationBuilder.DropColumn(
                name: "Icon",
                schema: "dep",
                table: "UniversalGridConfigurations");

            migrationBuilder.AddColumn<string>(
                name: "Lable",
                schema: "dep",
                table: "SiteMenus",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "SiteMenus",
                keyColumn: "Id",
                keyValue: new Guid("4e22e18e-492e-4786-8170-fb8f0c9d3a62"),
                columns: new[] { "Lable", "Name" },
                values: new object[] { "User Management", "UserManagement" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Lable",
                schema: "dep",
                table: "SiteMenus");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                schema: "dep",
                table: "UniversalGridConfigurations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Icon",
                schema: "dep",
                table: "UniversalGridConfigurations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "SiteMenus",
                keyColumn: "Id",
                keyValue: new Guid("4e22e18e-492e-4786-8170-fb8f0c9d3a62"),
                column: "Name",
                value: "User Management");

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "UniversalGridConfigurations",
                keyColumn: "Id",
                keyValue: new Guid("071f5419-85b8-11ed-a86f-0242ac130004"),
                columns: new[] { "Description", "Icon" },
                values: new object[] { "User Management", "" });
        }
    }
}
