using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class siteSettings : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SiteSettings",
                schema: "dep",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SiteName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SiteLogo = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SiteSettings", x => x.Id);
                });

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "SiteMenus",
                keyColumn: "Id",
                keyValue: new Guid("cbf29ec9-b605-45f1-a84f-5a7fc99ad6b3"),
                column: "Link",
                value: "/site-settings");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SiteSettings",
                schema: "dep");

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "SiteMenus",
                keyColumn: "Id",
                keyValue: new Guid("cbf29ec9-b605-45f1-a84f-5a7fc99ad6b3"),
                column: "Link",
                value: "");
        }
    }
}
