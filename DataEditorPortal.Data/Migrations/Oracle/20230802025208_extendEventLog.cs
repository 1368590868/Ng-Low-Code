using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.Oracle
{
    public partial class extendEventLog : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DETAILS1",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "EVENT_LOGS",
                type: "CLOB",
                nullable: true);

            migrationBuilder.Sql($"UPDATE {Common.Constants.DEFAULT_SCHEMA}.EVENT_LOGS SET DETAILS1 = DETAILS;");

            migrationBuilder.DropColumn(
                name: "DETAILS",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "EVENT_LOGS");

            migrationBuilder.RenameColumn(
                name: "DETAILS1",
                newName: "DETAILS",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "EVENT_LOGS");

            migrationBuilder.AddColumn<string>(
                name: "PARAMS1",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "EVENT_LOGS",
                type: "CLOB",
                nullable: true);

            migrationBuilder.Sql($"UPDATE {Common.Constants.DEFAULT_SCHEMA}.EVENT_LOGS SET PARAMS1 = PARAMS;");

            migrationBuilder.DropColumn(
                name: "PARAMS",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "EVENT_LOGS");

            migrationBuilder.RenameColumn(
                name: "PARAMS1",
                newName: "PARAMS",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "EVENT_LOGS");

            migrationBuilder.AddColumn<string>(
                name: "CONNECTION",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "EVENT_LOGS",
                type: "NVARCHAR2(2000)",
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
