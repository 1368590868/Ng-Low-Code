using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataEditorPortal.Data.Migrations.Oracle
{
    public partial class existingSearch : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EXISTING_SEARCH_NAME",
                schema: "DATA_EDITOR_PORTAL",
                table: "UNIVERSAL_GRID_CONFIGURATIONS",
                type: "NVARCHAR2(2000)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "USE_EXISTING_SEARCH",
                schema: "DATA_EDITOR_PORTAL",
                table: "UNIVERSAL_GRID_CONFIGURATIONS",
                type: "NUMBER(1)",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EXISTING_SEARCH_NAME",
                schema: "DATA_EDITOR_PORTAL",
                table: "UNIVERSAL_GRID_CONFIGURATIONS");

            migrationBuilder.DropColumn(
                name: "USE_EXISTING_SEARCH",
                schema: "DATA_EDITOR_PORTAL",
                table: "UNIVERSAL_GRID_CONFIGURATIONS");
        }
    }
}
