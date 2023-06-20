using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class lookups : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "UNIVERSAL_GRID_CONFIGURATION_ID",
                schema: "DATA_EDITOR_PORTAL",
                table: "LOOKUPS",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_LOOKUPS_UNIVERSAL_GRID_CONFIGURATION_ID",
                schema: "DATA_EDITOR_PORTAL",
                table: "LOOKUPS",
                column: "UNIVERSAL_GRID_CONFIGURATION_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_LOOKUPS_UNIVERSAL_GRID_CONFIGURATIONS_UNIVERSAL_GRID_CONFIGURATION_ID",
                schema: "DATA_EDITOR_PORTAL",
                table: "LOOKUPS",
                column: "UNIVERSAL_GRID_CONFIGURATION_ID",
                principalSchema: "DATA_EDITOR_PORTAL",
                principalTable: "UNIVERSAL_GRID_CONFIGURATIONS",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LOOKUPS_UNIVERSAL_GRID_CONFIGURATIONS_UNIVERSAL_GRID_CONFIGURATION_ID",
                schema: "DATA_EDITOR_PORTAL",
                table: "LOOKUPS");

            migrationBuilder.DropIndex(
                name: "IX_LOOKUPS_UNIVERSAL_GRID_CONFIGURATION_ID",
                schema: "DATA_EDITOR_PORTAL",
                table: "LOOKUPS");

            migrationBuilder.DropColumn(
                name: "UNIVERSAL_GRID_CONFIGURATION_ID",
                schema: "DATA_EDITOR_PORTAL",
                table: "LOOKUPS");
        }
    }
}
