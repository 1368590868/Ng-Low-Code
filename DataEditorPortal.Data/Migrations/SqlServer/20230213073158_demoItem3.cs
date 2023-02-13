using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class demoItem3 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Division",
                schema: "dbo",
                table: "DemoTables",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Employor",
                schema: "dbo",
                table: "DemoTables",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Vendor",
                schema: "dbo",
                table: "DemoTables",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Division",
                schema: "dbo",
                table: "DemoTables");

            migrationBuilder.DropColumn(
                name: "Employor",
                schema: "dbo",
                table: "DemoTables");

            migrationBuilder.DropColumn(
                name: "Vendor",
                schema: "dbo",
                table: "DemoTables");
        }
    }
}
