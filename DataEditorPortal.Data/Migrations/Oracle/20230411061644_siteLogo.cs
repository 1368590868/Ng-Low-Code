using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.Oracle
{
    public partial class siteLogo : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "SITE_LOGO",
                schema: "DATA_EDITOR_PORTAL",
                table: "SITE_SETTINGS",
                type: "CLOB",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "NVARCHAR2(2000)",
                oldNullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "SITE_LOGO",
                schema: "DATA_EDITOR_PORTAL",
                table: "SITE_SETTINGS",
                type: "NVARCHAR2(2000)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "CLOB",
                oldNullable: true);
        }
    }
}
