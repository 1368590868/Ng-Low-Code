using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class siteGroupTitle : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TITLE",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "SITE_GROUPS",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TITLE",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "SITE_GROUPS");
        }
    }
}
