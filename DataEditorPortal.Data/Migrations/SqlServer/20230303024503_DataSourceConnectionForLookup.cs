using Microsoft.EntityFrameworkCore.Migrations;
using System;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class DataSourceConnectionForLookup : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "DataSourceConnectionId",
                schema: "dep",
                table: "Lookups",
                type: "uniqueidentifier",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DataSourceConnectionId",
                schema: "dep",
                table: "Lookups");
        }
    }
}
