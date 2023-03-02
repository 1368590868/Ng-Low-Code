using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class DataSourceConnection : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "DataSourceConnectionId",
                schema: "dep",
                table: "UniversalGridConfigurations",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "DataSourceConnections",
                schema: "dep",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConnectionString = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DataSourceConnections", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UniversalGridConfigurations_DataSourceConnectionId",
                schema: "dep",
                table: "UniversalGridConfigurations",
                column: "DataSourceConnectionId");

            migrationBuilder.AddForeignKey(
                name: "FK_UniversalGridConfigurations_DataSourceConnections_DataSourceConnectionId",
                schema: "dep",
                table: "UniversalGridConfigurations",
                column: "DataSourceConnectionId",
                principalSchema: "dep",
                principalTable: "DataSourceConnections",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UniversalGridConfigurations_DataSourceConnections_DataSourceConnectionId",
                schema: "dep",
                table: "UniversalGridConfigurations");

            migrationBuilder.DropTable(
                name: "DataSourceConnections",
                schema: "dep");

            migrationBuilder.DropIndex(
                name: "IX_UniversalGridConfigurations_DataSourceConnectionId",
                schema: "dep",
                table: "UniversalGridConfigurations");

            migrationBuilder.DropColumn(
                name: "DataSourceConnectionId",
                schema: "dep",
                table: "UniversalGridConfigurations");
        }
    }
}
