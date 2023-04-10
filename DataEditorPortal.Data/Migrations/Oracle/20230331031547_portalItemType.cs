using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.Oracle
{
    public partial class portalItemType : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ITEM_TYPE",
                schema: "DATA_EDITOR_PORTAL",
                table: "UNIVERSAL_GRID_CONFIGURATIONS",
                type: "NVARCHAR2(2000)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ITEM_TYPE",
                schema: "DATA_EDITOR_PORTAL",
                table: "UNIVERSAL_GRID_CONFIGURATIONS");
        }
    }
}
