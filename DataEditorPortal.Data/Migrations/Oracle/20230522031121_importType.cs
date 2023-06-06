using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.Oracle
{
    public partial class importType : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IMPORT_TYPE",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "DATA_IMPORT_HISTORIES",
                type: "NUMBER(10)",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IMPORT_TYPE",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "DATA_IMPORT_HISTORIES");
        }
    }
}
