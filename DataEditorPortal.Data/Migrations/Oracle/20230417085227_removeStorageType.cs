using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.Oracle
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
                type: "NVARCHAR2(2000)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "NUMBER(10)");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "STATUS",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "UPLOADED_FILE",
                type: "NUMBER(10)",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(string),
                oldType: "NVARCHAR2(2000)",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "STORAGE_TYPE",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "UPLOADED_FILE",
                type: "NUMBER(10)",
                nullable: false,
                defaultValue: 0);
        }
    }
}
