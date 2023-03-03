using System;
using Microsoft.EntityFrameworkCore.Migrations;

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
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Lookups_DataSourceConnectionId",
                schema: "dep",
                table: "Lookups",
                column: "DataSourceConnectionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Lookups_DataSourceConnections_DataSourceConnectionId",
                schema: "dep",
                table: "Lookups",
                column: "DataSourceConnectionId",
                principalSchema: "dep",
                principalTable: "DataSourceConnections",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Lookups_DataSourceConnections_DataSourceConnectionId",
                schema: "dep",
                table: "Lookups");

            migrationBuilder.DropIndex(
                name: "IX_Lookups_DataSourceConnectionId",
                schema: "dep",
                table: "Lookups");

            migrationBuilder.DropColumn(
                name: "DataSourceConnectionId",
                schema: "dep",
                table: "Lookups");
        }
    }
}
