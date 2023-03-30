using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class uploadedFile : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UPLOADED_FILE",
                schema: "DATA_EDITOR_PORTAL",
                columns: table => new
                {
                    ID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FILE_NAME = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CONTENT_TYPE = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    STORAGE_TYPE = table.Column<int>(type: "int", nullable: false),
                    COMMENTS = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    STATUS = table.Column<int>(type: "int", nullable: false),
                    FILE_PATH = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FILE_BYTES = table.Column<byte[]>(type: "varbinary(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UPLOADED_FILE", x => x.ID);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UPLOADED_FILE",
                schema: "DATA_EDITOR_PORTAL");
        }
    }
}
