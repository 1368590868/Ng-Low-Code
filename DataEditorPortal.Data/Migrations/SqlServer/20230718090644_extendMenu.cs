using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class extendMenu : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "COMPONENT",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "SITE_MENUS",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "REQUIRE_ADMIN",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "SITE_MENUS",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "REQUIRE_AUTH",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "SITE_MENUS",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "COMPONENT",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "SITE_MENUS");

            migrationBuilder.DropColumn(
                name: "REQUIRE_ADMIN",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "SITE_MENUS");

            migrationBuilder.DropColumn(
                name: "REQUIRE_AUTH",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "SITE_MENUS");
        }
    }
}
