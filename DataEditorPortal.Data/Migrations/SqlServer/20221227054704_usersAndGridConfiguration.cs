using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class usersAndGridConfiguration : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UniversalGridConfigurations",
                schema: "dep",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Icon = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataSourceConfig = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ColumnsConfig = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SearchConfig = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UseCustomDetailDialog = table.Column<bool>(type: "bit", nullable: false),
                    DetailDialogConfig = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UniversalGridConfigurations", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UniversalGridConfigurations",
                schema: "dep");
        }
    }
}
