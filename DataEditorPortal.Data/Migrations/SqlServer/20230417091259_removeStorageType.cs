using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class removeStorageType : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "STORAGE_TYPE",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "UPLOADED_FILE");

            migrationBuilder.AlterColumn<string>(
                name: "STATUS",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "UPLOADED_FILE",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<string>(
                name: "DATA_ID",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "UPLOADED_FILE",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DATA_ID",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "UPLOADED_FILE");

            migrationBuilder.AlterColumn<int>(
                name: "STATUS",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "UPLOADED_FILE",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "STORAGE_TYPE",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "UPLOADED_FILE",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
