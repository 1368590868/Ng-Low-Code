using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class rename : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SitePermissionRoles",
                schema: "dep");

            migrationBuilder.CreateTable(
                name: "SiteRolePermissions",
                schema: "dep",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SitePermissionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SiteRoleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SiteRolePermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SiteRolePermissions_SitePermissions_SitePermissionId",
                        column: x => x.SitePermissionId,
                        principalSchema: "dep",
                        principalTable: "SitePermissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SiteRolePermissions_SiteRoles_SiteRoleId",
                        column: x => x.SiteRoleId,
                        principalSchema: "dep",
                        principalTable: "SiteRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SiteRolePermissions_SitePermissionId",
                schema: "dep",
                table: "SiteRolePermissions",
                column: "SitePermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_SiteRolePermissions_SiteRoleId",
                schema: "dep",
                table: "SiteRolePermissions",
                column: "SiteRoleId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SiteRolePermissions",
                schema: "dep");

            migrationBuilder.CreateTable(
                name: "SitePermissionRoles",
                schema: "dep",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SitePermissionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SiteRoleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SitePermissionRoles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SitePermissionRoles_SitePermissions_SitePermissionId",
                        column: x => x.SitePermissionId,
                        principalSchema: "dep",
                        principalTable: "SitePermissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SitePermissionRoles_SiteRoles_SiteRoleId",
                        column: x => x.SiteRoleId,
                        principalSchema: "dep",
                        principalTable: "SiteRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SitePermissionRoles_SitePermissionId",
                schema: "dep",
                table: "SitePermissionRoles",
                column: "SitePermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_SitePermissionRoles_SiteRoleId",
                schema: "dep",
                table: "SitePermissionRoles",
                column: "SiteRoleId");
        }
    }
}
