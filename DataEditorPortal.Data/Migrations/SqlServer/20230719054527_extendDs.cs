using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class extendDs : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "INCLUDE_SCHEMAS",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "DATA_SOURCE_CONNECTIONS",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TABLE_NAME_RULE",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "DATA_SOURCE_CONNECTIONS",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "INCLUDE_SCHEMAS",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "DATA_SOURCE_CONNECTIONS");

            migrationBuilder.DropColumn(
                name: "TABLE_NAME_RULE",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "DATA_SOURCE_CONNECTIONS");
        }
    }
}
