using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.Oracle
{
    public partial class UploadedFileDataId : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DATA_ID",
                schema: "DATA_EDITOR_PORTAL",
                table: "UPLOADED_FILE",
                type: "NVARCHAR2(2000)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DATA_ID",
                schema: "DATA_EDITOR_PORTAL",
                table: "UPLOADED_FILE");
        }
    }
}
