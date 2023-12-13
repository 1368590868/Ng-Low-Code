using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class dataUpdateHistories2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FIELD_CONFIG",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "DATA_UPDATE_HISTORIES",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FIELD_CONFIG",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "DATA_UPDATE_HISTORIES");
        }
    }
}
