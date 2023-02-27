using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class siteEventLog : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "dep",
                table: "SiteMenus",
                keyColumn: "Id",
                keyValue: new Guid("b0864169-8ca1-49e4-ae1e-bfc53756231b"),
                column: "Name",
                value: "system-event-logs");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "dep",
                table: "SiteMenus",
                keyColumn: "Id",
                keyValue: new Guid("b0864169-8ca1-49e4-ae1e-bfc53756231b"),
                column: "Name",
                value: "site-settings");
        }
    }
}
