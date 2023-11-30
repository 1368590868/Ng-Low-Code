using Microsoft.EntityFrameworkCore.Migrations;
using System;

#nullable disable

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class dataUpdateHistories : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DATA_UPDATE_HISTORIES",
                schema: Common.Constants.DEFAULT_SCHEMA,
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CREATE_DATE = table.Column<DateTime>(type: "datetime2", nullable: false),
                    USERNAME = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GRID_CONFIG_ID = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DATA_ID = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FIELD = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ORIGINAL_VALUE = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NEW_VALUE = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ACTION_TYPE = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DATA_UPDATE_HISTORIES", x => x.ID);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DATA_UPDATE_HISTORIES",
                schema: Common.Constants.DEFAULT_SCHEMA);
        }
    }
}
