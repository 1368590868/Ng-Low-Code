using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class dataUpdateHistories1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "VALUE_TYPE",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "DATA_UPDATE_HISTORIES",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "VALUE_TYPE",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "DATA_UPDATE_HISTORIES");
        }
    }
}
