using Microsoft.EntityFrameworkCore.Migrations;
using System;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class changeDsKey : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LOOKUPS_DATA_SOURCE_CONNECTIONS_DATA_SOURCE_CONNECTION_ID",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "LOOKUPS");

            migrationBuilder.DropForeignKey(
                name: "FK_UNIVERSAL_GRID_CONFIGURATIONS_DATA_SOURCE_CONNECTIONS_DATA_SOURCE_CONNECTION_ID",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "UNIVERSAL_GRID_CONFIGURATIONS");

            migrationBuilder.DropIndex(
                name: "IX_UNIVERSAL_GRID_CONFIGURATIONS_DATA_SOURCE_CONNECTION_ID",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "UNIVERSAL_GRID_CONFIGURATIONS");

            migrationBuilder.DropIndex(
                name: "IX_LOOKUPS_DATA_SOURCE_CONNECTION_ID",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "LOOKUPS");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DATA_SOURCE_CONNECTIONS",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "DATA_SOURCE_CONNECTIONS");

            migrationBuilder.DropColumn(
                name: "DATA_SOURCE_CONNECTION_ID",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "UNIVERSAL_GRID_CONFIGURATIONS");

            migrationBuilder.DropColumn(
                name: "DATA_SOURCE_CONNECTION_ID",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "LOOKUPS");

            migrationBuilder.DropColumn(
                name: "ID",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "DATA_SOURCE_CONNECTIONS");

            migrationBuilder.AddColumn<string>(
                name: "DATA_SOURCE_CONNECTION_NAME",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "UNIVERSAL_GRID_CONFIGURATIONS",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DATA_SOURCE_CONNECTION_NAME",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "LOOKUPS",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "NAME",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "DATA_SOURCE_CONNECTIONS",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_DATA_SOURCE_CONNECTIONS",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "DATA_SOURCE_CONNECTIONS",
                column: "NAME");

            migrationBuilder.CreateIndex(
                name: "IX_UNIVERSAL_GRID_CONFIGURATIONS_DATA_SOURCE_CONNECTION_NAME",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "UNIVERSAL_GRID_CONFIGURATIONS",
                column: "DATA_SOURCE_CONNECTION_NAME");

            migrationBuilder.CreateIndex(
                name: "IX_LOOKUPS_DATA_SOURCE_CONNECTION_NAME",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "LOOKUPS",
                column: "DATA_SOURCE_CONNECTION_NAME");

            migrationBuilder.AddForeignKey(
                name: "FK_LOOKUPS_DATA_SOURCE_CONNECTIONS_DATA_SOURCE_CONNECTION_NAME",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "LOOKUPS",
                column: "DATA_SOURCE_CONNECTION_NAME",
                principalSchema: Data.Common.Constants.DEFAULT_SCHEMA,
                principalTable: "DATA_SOURCE_CONNECTIONS",
                principalColumn: "NAME",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UNIVERSAL_GRID_CONFIGURATIONS_DATA_SOURCE_CONNECTIONS_DATA_SOURCE_CONNECTION_NAME",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "UNIVERSAL_GRID_CONFIGURATIONS",
                column: "DATA_SOURCE_CONNECTION_NAME",
                principalSchema: Data.Common.Constants.DEFAULT_SCHEMA,
                principalTable: "DATA_SOURCE_CONNECTIONS",
                principalColumn: "NAME",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LOOKUPS_DATA_SOURCE_CONNECTIONS_DATA_SOURCE_CONNECTION_NAME",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "LOOKUPS");

            migrationBuilder.DropForeignKey(
                name: "FK_UNIVERSAL_GRID_CONFIGURATIONS_DATA_SOURCE_CONNECTIONS_DATA_SOURCE_CONNECTION_NAME",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "UNIVERSAL_GRID_CONFIGURATIONS");

            migrationBuilder.DropIndex(
                name: "IX_UNIVERSAL_GRID_CONFIGURATIONS_DATA_SOURCE_CONNECTION_NAME",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "UNIVERSAL_GRID_CONFIGURATIONS");

            migrationBuilder.DropIndex(
                name: "IX_LOOKUPS_DATA_SOURCE_CONNECTION_NAME",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "LOOKUPS");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DATA_SOURCE_CONNECTIONS",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "DATA_SOURCE_CONNECTIONS");

            migrationBuilder.DropColumn(
                name: "DATA_SOURCE_CONNECTION_NAME",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "UNIVERSAL_GRID_CONFIGURATIONS");

            migrationBuilder.DropColumn(
                name: "DATA_SOURCE_CONNECTION_NAME",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "LOOKUPS");

            migrationBuilder.AddColumn<Guid>(
                name: "DATA_SOURCE_CONNECTION_ID",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "UNIVERSAL_GRID_CONFIGURATIONS",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DATA_SOURCE_CONNECTION_ID",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "LOOKUPS",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AlterColumn<string>(
                name: "NAME",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "DATA_SOURCE_CONNECTIONS",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddColumn<Guid>(
                name: "ID",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "DATA_SOURCE_CONNECTIONS",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddPrimaryKey(
                name: "PK_DATA_SOURCE_CONNECTIONS",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "DATA_SOURCE_CONNECTIONS",
                column: "ID");

            migrationBuilder.CreateIndex(
                name: "IX_UNIVERSAL_GRID_CONFIGURATIONS_DATA_SOURCE_CONNECTION_ID",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "UNIVERSAL_GRID_CONFIGURATIONS",
                column: "DATA_SOURCE_CONNECTION_ID");

            migrationBuilder.CreateIndex(
                name: "IX_LOOKUPS_DATA_SOURCE_CONNECTION_ID",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "LOOKUPS",
                column: "DATA_SOURCE_CONNECTION_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_LOOKUPS_DATA_SOURCE_CONNECTIONS_DATA_SOURCE_CONNECTION_ID",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "LOOKUPS",
                column: "DATA_SOURCE_CONNECTION_ID",
                principalSchema: Data.Common.Constants.DEFAULT_SCHEMA,
                principalTable: "DATA_SOURCE_CONNECTIONS",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UNIVERSAL_GRID_CONFIGURATIONS_DATA_SOURCE_CONNECTIONS_DATA_SOURCE_CONNECTION_ID",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "UNIVERSAL_GRID_CONFIGURATIONS",
                column: "DATA_SOURCE_CONNECTION_ID",
                principalSchema: Data.Common.Constants.DEFAULT_SCHEMA,
                principalTable: "DATA_SOURCE_CONNECTIONS",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
