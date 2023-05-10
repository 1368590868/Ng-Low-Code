using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.Oracle
{
    public partial class dataImport : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DATA_IMPORT_HISTORIES",
                schema: "DATA_EDITOR_PORTAL",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "RAW(16)", nullable: false),
                    NAME = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    GRID_COINFG_ID = table.Column<Guid>(type: "RAW(16)", nullable: false),
                    STATUS = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    RESULT = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    CREATED_BY = table.Column<Guid>(type: "RAW(16)", nullable: false),
                    CREATED_DATE = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DATA_IMPORT_HISTORIES", x => x.ID);
                    table.ForeignKey(
                        name: "FK_DATA_IMPORT_HISTORIES_UNIV~",
                        column: x => x.GRID_COINFG_ID,
                        principalSchema: "DATA_EDITOR_PORTAL",
                        principalTable: "UNIVERSAL_GRID_CONFIGURATIONS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DATA_IMPORT_HISTORIES_USER~",
                        column: x => x.CREATED_BY,
                        principalSchema: "DATA_EDITOR_PORTAL",
                        principalTable: "USERS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DATA_IMPORT_HISTORIES_CREA~",
                schema: "DATA_EDITOR_PORTAL",
                table: "DATA_IMPORT_HISTORIES",
                column: "CREATED_BY");

            migrationBuilder.CreateIndex(
                name: "IX_DATA_IMPORT_HISTORIES_GRID~",
                schema: "DATA_EDITOR_PORTAL",
                table: "DATA_IMPORT_HISTORIES",
                column: "GRID_COINFG_ID");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DATA_IMPORT_HISTORIES",
                schema: "DATA_EDITOR_PORTAL");
        }
    }
}
