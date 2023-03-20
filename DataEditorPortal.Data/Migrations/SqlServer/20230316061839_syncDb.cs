using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class syncDb : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LICENSE",
                schema: "DATA_EDITOR_PORTAL",
                table: "SITE_SETTINGS",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LICENSE",
                schema: "DATA_EDITOR_PORTAL",
                table: "SITE_SETTINGS");
        }
    }
}
