using Microsoft.EntityFrameworkCore.Migrations;
using System;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class dataImport : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DATA_IMPORT_HISTORIES",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NAME = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GRID_COINFG_ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    STATUS = table.Column<int>(type: "int", nullable: false),
                    RESULT = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CREATED_BY = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CREATED_DATE = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DATA_IMPORT_HISTORIES", x => x.ID);
                    table.ForeignKey(
                        name: "FK_DATA_IMPORT_HISTORIES_UNIVERSAL_GRID_CONFIGURATIONS_GRID_COINFG_ID",
                        column: x => x.GRID_COINFG_ID,
                        principalSchema: Data.Common.Constants.DEFAULT_SCHEMA,
                        principalTable: "UNIVERSAL_GRID_CONFIGURATIONS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DATA_IMPORT_HISTORIES_USERS_CREATED_BY",
                        column: x => x.CREATED_BY,
                        principalSchema: Data.Common.Constants.DEFAULT_SCHEMA,
                        principalTable: "USERS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DATA_IMPORT_HISTORIES_CREATED_BY",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "DATA_IMPORT_HISTORIES",
                column: "CREATED_BY");

            migrationBuilder.CreateIndex(
                name: "IX_DATA_IMPORT_HISTORIES_GRID_COINFG_ID",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "DATA_IMPORT_HISTORIES",
                column: "GRID_COINFG_ID");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DATA_IMPORT_HISTORIES",
                schema: Data.Common.Constants.DEFAULT_SCHEMA);
        }
    }
}
