using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.Oracle
{
    public partial class uploadedFile : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UPLOADED_FILE",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                columns: table => new
                {
                    ID = table.Column<string>(type: "NVARCHAR2(450)", nullable: false),
                    FILE_NAME = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    CONTENT_TYPE = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    STORAGE_TYPE = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    COMMENTS = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    STATUS = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    FILE_PATH = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    FILE_BYTES = table.Column<byte[]>(type: "BLOB", nullable: true)
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
                schema: Data.Common.Constants.DEFAULT_SCHEMA);
        }
    }
}
