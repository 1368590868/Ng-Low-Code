﻿using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class portalItemType : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ITEM_TYPE",
                schema: "DATA_EDITOR_PORTAL",
                table: "UNIVERSAL_GRID_CONFIGURATIONS",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ITEM_TYPE",
                schema: "DATA_EDITOR_PORTAL",
                table: "UNIVERSAL_GRID_CONFIGURATIONS");
        }
    }
}