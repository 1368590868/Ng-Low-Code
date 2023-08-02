using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class extendEventLog : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CONNECTION",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "EVENT_LOGS",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CONNECTION",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "EVENT_LOGS");
        }
    }
}
