using Microsoft.EntityFrameworkCore.Migrations;
using System;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class savedSearches : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SAVED_SEARCHES",
                schema: Common.Constants.DEFAULT_SCHEMA,
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NAME = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SEARCH_PARAMS = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    USERID = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UNIVERSAL_GRID_CONFIG_ID = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SAVED_SEARCHES", x => x.ID);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SAVED_SEARCHES",
                schema: Common.Constants.DEFAULT_SCHEMA);
        }
    }
}
