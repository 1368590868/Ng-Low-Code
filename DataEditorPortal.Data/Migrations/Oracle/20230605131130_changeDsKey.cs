using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.Oracle
{
    public partial class changeDsKey : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LOOKUPS_DATA_SOURCE_CONNEC~",
                schema: "DATA_EDITOR_PORTAL",
                table: "LOOKUPS");

            migrationBuilder.DropForeignKey(
                name: "FK_UNIVERSAL_GRID_CONFIGURATI~",
                schema: "DATA_EDITOR_PORTAL",
                table: "UNIVERSAL_GRID_CONFIGURATIONS");

            migrationBuilder.DropIndex(
                name: "IX_UNIVERSAL_GRID_CONFIGURATI~",
                schema: "DATA_EDITOR_PORTAL",
                table: "UNIVERSAL_GRID_CONFIGURATIONS");

            migrationBuilder.DropIndex(
                name: "IX_LOOKUPS_DATA_SOURCE_CONNEC~",
                schema: "DATA_EDITOR_PORTAL",
                table: "LOOKUPS");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DATA_SOURCE_CONNECTIONS",
                schema: "DATA_EDITOR_PORTAL",
                table: "DATA_SOURCE_CONNECTIONS");

            migrationBuilder.DropColumn(
                name: "DATA_SOURCE_CONNECTION_ID",
                schema: "DATA_EDITOR_PORTAL",
                table: "UNIVERSAL_GRID_CONFIGURATIONS");

            migrationBuilder.DropColumn(
                name: "DATA_SOURCE_CONNECTION_ID",
                schema: "DATA_EDITOR_PORTAL",
                table: "LOOKUPS");

            migrationBuilder.DropColumn(
                name: "ID",
                schema: "DATA_EDITOR_PORTAL",
                table: "DATA_SOURCE_CONNECTIONS");

            migrationBuilder.AddColumn<string>(
                name: "DATA_SOURCE_CONNECTION_NAME",
                schema: "DATA_EDITOR_PORTAL",
                table: "UNIVERSAL_GRID_CONFIGURATIONS",
                type: "NVARCHAR2(450)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DATA_SOURCE_CONNECTION_NAME",
                schema: "DATA_EDITOR_PORTAL",
                table: "LOOKUPS",
                type: "NVARCHAR2(450)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "NAME",
                schema: "DATA_EDITOR_PORTAL",
                table: "DATA_SOURCE_CONNECTIONS",
                type: "NVARCHAR2(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "NVARCHAR2(2000)",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_DATA_SOURCE_CONNECTIONS",
                schema: "DATA_EDITOR_PORTAL",
                table: "DATA_SOURCE_CONNECTIONS",
                column: "NAME");

            migrationBuilder.CreateIndex(
                name: "IX_UNIVERSAL_GRID_CONFIGURATI~",
                schema: "DATA_EDITOR_PORTAL",
                table: "UNIVERSAL_GRID_CONFIGURATIONS",
                column: "DATA_SOURCE_CONNECTION_NAME");

            migrationBuilder.CreateIndex(
                name: "IX_LOOKUPS_DATA_SOURCE_CONNEC~",
                schema: "DATA_EDITOR_PORTAL",
                table: "LOOKUPS",
                column: "DATA_SOURCE_CONNECTION_NAME");

            migrationBuilder.AddForeignKey(
                name: "FK_LOOKUPS_DATA_SOURCE_CONNEC~",
                schema: "DATA_EDITOR_PORTAL",
                table: "LOOKUPS",
                column: "DATA_SOURCE_CONNECTION_NAME",
                principalSchema: "DATA_EDITOR_PORTAL",
                principalTable: "DATA_SOURCE_CONNECTIONS",
                principalColumn: "NAME",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UNIVERSAL_GRID_CONFIGURATI~",
                schema: "DATA_EDITOR_PORTAL",
                table: "UNIVERSAL_GRID_CONFIGURATIONS",
                column: "DATA_SOURCE_CONNECTION_NAME",
                principalSchema: "DATA_EDITOR_PORTAL",
                principalTable: "DATA_SOURCE_CONNECTIONS",
                principalColumn: "NAME",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LOOKUPS_DATA_SOURCE_CONNEC~",
                schema: "DATA_EDITOR_PORTAL",
                table: "LOOKUPS");

            migrationBuilder.DropForeignKey(
                name: "FK_UNIVERSAL_GRID_CONFIGURATI~",
                schema: "DATA_EDITOR_PORTAL",
                table: "UNIVERSAL_GRID_CONFIGURATIONS");

            migrationBuilder.DropIndex(
                name: "IX_UNIVERSAL_GRID_CONFIGURATI~",
                schema: "DATA_EDITOR_PORTAL",
                table: "UNIVERSAL_GRID_CONFIGURATIONS");

            migrationBuilder.DropIndex(
                name: "IX_LOOKUPS_DATA_SOURCE_CONNEC~",
                schema: "DATA_EDITOR_PORTAL",
                table: "LOOKUPS");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DATA_SOURCE_CONNECTIONS",
                schema: "DATA_EDITOR_PORTAL",
                table: "DATA_SOURCE_CONNECTIONS");

            migrationBuilder.DropColumn(
                name: "DATA_SOURCE_CONNECTION_NAME",
                schema: "DATA_EDITOR_PORTAL",
                table: "UNIVERSAL_GRID_CONFIGURATIONS");

            migrationBuilder.DropColumn(
                name: "DATA_SOURCE_CONNECTION_NAME",
                schema: "DATA_EDITOR_PORTAL",
                table: "LOOKUPS");

            migrationBuilder.AddColumn<Guid>(
                name: "DATA_SOURCE_CONNECTION_ID",
                schema: "DATA_EDITOR_PORTAL",
                table: "UNIVERSAL_GRID_CONFIGURATIONS",
                type: "RAW(16)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DATA_SOURCE_CONNECTION_ID",
                schema: "DATA_EDITOR_PORTAL",
                table: "LOOKUPS",
                type: "RAW(16)",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AlterColumn<string>(
                name: "NAME",
                schema: "DATA_EDITOR_PORTAL",
                table: "DATA_SOURCE_CONNECTIONS",
                type: "NVARCHAR2(2000)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "NVARCHAR2(450)");

            migrationBuilder.AddColumn<Guid>(
                name: "ID",
                schema: "DATA_EDITOR_PORTAL",
                table: "DATA_SOURCE_CONNECTIONS",
                type: "RAW(16)",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddPrimaryKey(
                name: "PK_DATA_SOURCE_CONNECTIONS",
                schema: "DATA_EDITOR_PORTAL",
                table: "DATA_SOURCE_CONNECTIONS",
                column: "ID");

            migrationBuilder.CreateIndex(
                name: "IX_UNIVERSAL_GRID_CONFIGURATI~",
                schema: "DATA_EDITOR_PORTAL",
                table: "UNIVERSAL_GRID_CONFIGURATIONS",
                column: "DATA_SOURCE_CONNECTION_ID");

            migrationBuilder.CreateIndex(
                name: "IX_LOOKUPS_DATA_SOURCE_CONNEC~",
                schema: "DATA_EDITOR_PORTAL",
                table: "LOOKUPS",
                column: "DATA_SOURCE_CONNECTION_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_LOOKUPS_DATA_SOURCE_CONNEC~",
                schema: "DATA_EDITOR_PORTAL",
                table: "LOOKUPS",
                column: "DATA_SOURCE_CONNECTION_ID",
                principalSchema: "DATA_EDITOR_PORTAL",
                principalTable: "DATA_SOURCE_CONNECTIONS",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UNIVERSAL_GRID_CONFIGURATI~",
                schema: "DATA_EDITOR_PORTAL",
                table: "UNIVERSAL_GRID_CONFIGURATIONS",
                column: "DATA_SOURCE_CONNECTION_ID",
                principalSchema: "DATA_EDITOR_PORTAL",
                principalTable: "DATA_SOURCE_CONNECTIONS",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
