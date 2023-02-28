using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class adminRole : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                schema: "dep",
                table: "SiteRoles",
                columns: new[] { "Id", "RoleDescription", "RoleName" },
                values: new object[] { new Guid("790d7db8-feb2-40f8-8f74-5f228c0ada03"), null, "Administrators" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                schema: "dep",
                table: "SiteRoles",
                keyColumn: "Id",
                keyValue: new Guid("790d7db8-feb2-40f8-8f74-5f228c0ada03"));
        }
    }
}
