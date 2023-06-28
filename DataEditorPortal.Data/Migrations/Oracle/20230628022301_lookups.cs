using Microsoft.EntityFrameworkCore.Migrations;
using System;

namespace DataEditorPortal.Data.Migrations.Oracle
{
    public partial class lookups : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "UNIVERSAL_GRID_CONFIG_ID",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "LOOKUPS",
                type: "RAW(16)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_LOOKUPS_UNIVERSAL_GRID_CON~",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "LOOKUPS",
                column: "UNIVERSAL_GRID_CONFIG_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_LOOKUPS_UNIVERSAL_GRID_CON~",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "LOOKUPS",
                column: "UNIVERSAL_GRID_CONFIG_ID",
                principalSchema: Common.Constants.DEFAULT_SCHEMA,
                principalTable: "UNIVERSAL_GRID_CONFIGURATIONS",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LOOKUPS_UNIVERSAL_GRID_CON~",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "LOOKUPS");

            migrationBuilder.DropIndex(
                name: "IX_LOOKUPS_UNIVERSAL_GRID_CON~",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "LOOKUPS");

            migrationBuilder.DropColumn(
                name: "UNIVERSAL_GRID_CONFIG_ID",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "LOOKUPS");
        }
    }
}
