using Microsoft.EntityFrameworkCore.Migrations;
using System;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class siteGroup : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "SITE_GROUP_ID",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "SITE_CONTENTS",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "SITE_GROUPS",
                schema: Common.Constants.DEFAULT_SCHEMA,
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NAME = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DESCRIPTION = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SITE_GROUP", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "SITE_GROUP_SITE_MENU",
                schema: Common.Constants.DEFAULT_SCHEMA,
                columns: table => new
                {
                    SITE_GROUP_ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SITE_MENU_ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SITE_GROUP_SITE_MENU", x => new { x.SITE_GROUP_ID, x.SITE_MENU_ID });
                    table.ForeignKey(
                        name: "FK_SITE_GROUP_SITE_MENU_SITE_GROUP_SITE_GROUP_ID",
                        column: x => x.SITE_GROUP_ID,
                        principalSchema: Common.Constants.DEFAULT_SCHEMA,
                        principalTable: "SITE_GROUPS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SITE_GROUP_SITE_MENU_SITE_MENUS_SITE_MENU_ID",
                        column: x => x.SITE_MENU_ID,
                        principalSchema: Common.Constants.DEFAULT_SCHEMA,
                        principalTable: "SITE_MENUS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SITE_GROUP_SITE_MENU_SITE_MENU_ID",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "SITE_GROUP_SITE_MENU",
                column: "SITE_MENU_ID");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SITE_GROUP_SITE_MENU",
                schema: Common.Constants.DEFAULT_SCHEMA);

            migrationBuilder.DropTable(
                name: "SITE_GROUPS",
                schema: Common.Constants.DEFAULT_SCHEMA);

            migrationBuilder.DropColumn(
                name: "SITE_GROUP_ID",
                schema: Common.Constants.DEFAULT_SCHEMA,
                table: "SITE_CONTENTS");
        }
    }
}
