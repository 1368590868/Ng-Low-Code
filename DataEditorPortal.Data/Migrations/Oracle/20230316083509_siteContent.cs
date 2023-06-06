using Microsoft.EntityFrameworkCore.Migrations;
using System;

namespace DataEditorPortal.Data.Migrations.Oracle
{
    public partial class siteContent : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SITE_CONTENTS",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "RAW(16)", nullable: false),
                    CONTENT_NAME = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    CONTENT = table.Column<string>(type: "CLOB", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SITE_CONTENTS", x => x.ID);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SITE_CONTENTS",
                schema: Data.Common.Constants.DEFAULT_SCHEMA);
        }
    }
}
