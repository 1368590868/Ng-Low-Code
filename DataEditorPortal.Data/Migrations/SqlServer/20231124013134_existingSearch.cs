using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class existingSearch : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EXISTING_SEARCH_NAME",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "UNIVERSAL_GRID_CONFIGURATIONS",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "USE_EXISTING_SEARCH",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "UNIVERSAL_GRID_CONFIGURATIONS",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EXISTING_SEARCH_NAME",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "UNIVERSAL_GRID_CONFIGURATIONS");

            migrationBuilder.DropColumn(
                name: "USE_EXISTING_SEARCH",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "UNIVERSAL_GRID_CONFIGURATIONS");
        }
    }
}
