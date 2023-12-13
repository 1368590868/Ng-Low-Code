using Microsoft.EntityFrameworkCore.Migrations;
using System;

#nullable disable

namespace DataEditorPortal.Data.Migrations.Oracle
{
    public partial class dataUpdateHistories : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DATA_UPDATE_HISTORIES",
                schema: Common.Constants.DEFAULT_SCHEMA,
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "RAW(16)", nullable: false),
                    CREATE_DATE = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: false),
                    USERNAME = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    GRID_CONFIG_ID = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    DATA_ID = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    FIELD = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    ORIGINAL_VALUE = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    NEW_VALUE = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    VALUE_TYPE = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    ACTION_TYPE = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    FIELD_CONFIG = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DATA_UPDATE_HISTORIES", x => x.ID);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DATA_UPDATE_HISTORIES",
                schema: Common.Constants.DEFAULT_SCHEMA);
        }
    }
}
