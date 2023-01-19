using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class menuLink : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Link",
                schema: "dep",
                table: "SiteMenus",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.InsertData(
                schema: "dep",
                table: "SiteMenus",
                columns: new[] { "Id", "Description", "Icon", "Label", "Link", "Name", "Order", "ParentId", "Type" },
                values: new object[] { new Guid("b4b490ea-9df3-4f7a-8806-936ca7f87b8f"), null, "pi pi-desktop", "Portal Management", "/portal-management/list", "PortalManagement", 0, null, "" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                schema: "dep",
                table: "SiteMenus",
                keyColumn: "Id",
                keyValue: new Guid("b4b490ea-9df3-4f7a-8806-936ca7f87b8f"));

            migrationBuilder.DropColumn(
                name: "Link",
                schema: "dep",
                table: "SiteMenus");
        }
    }
}
