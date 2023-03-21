﻿using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class helpUrl : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "HELP_URL",
                schema: "DATA_EDITOR_PORTAL",
                table: "SITE_MENUS",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HELP_URL",
                schema: "DATA_EDITOR_PORTAL",
                table: "SITE_MENUS");
        }
    }
}