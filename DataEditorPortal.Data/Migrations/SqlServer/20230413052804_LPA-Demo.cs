using Microsoft.EntityFrameworkCore.Migrations;
using System;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class LPADemo : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GFORM_SITE_HIERARCHY_MV",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                columns: table => new
                {
                    HIERARCHY_GLOBALID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    DOT_OPERATOR_NAME = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SITETYPE = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SITENAME = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DIVISION_NAME = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AREA_NAME = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LOCATION = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GFORM_SITE_HIERARCHY_MV", x => x.HIERARCHY_GLOBALID);
                });

            migrationBuilder.CreateTable(
                name: "LPAREMEDIATIONACTSITE",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                columns: table => new
                {
                    OBJECTID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CREATIONUSER = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DATECREATED = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DATEMODIFIED = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LASTUSER = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GLOBALID = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EVENTID = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BOUNDARYGLOBALID = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FEATUREGLOBALID = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    STATUS = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TYPE = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LPAACTIVITYSTATUS = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    COMMENTS = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ASSIGNEDTO = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    REMEDIATIONPROPOSEDDATE = table.Column<DateTime>(type: "datetime2", nullable: true),
                    REMEDIATIONACTUALDATE = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LPAREMEDIATIONACTSITE", x => x.OBJECTID);
                });

            migrationBuilder.CreateTable(
                name: "LPASITE",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                columns: table => new
                {
                    OBJECTID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CREATIONUSER = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DATECREATED = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DATEMODIFIED = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LASTUSER = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GLOBALID = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EVENTID = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BOUNDARYGLOBALID = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FEATUREGLOBALID = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    STATUS = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LPANAME = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TYPE = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LPASTATUS = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    COMMENTS = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DISCOVERYDATE = table.Column<DateTime>(type: "datetime2", nullable: true),
                    D40CRITERIA = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ASSESSEDBY = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    REQREMEDIATIONDATE = table.Column<DateTime>(type: "datetime2", nullable: true),
                    REMEDIATIONPROPOSEDDATE = table.Column<DateTime>(type: "datetime2", nullable: true),
                    REMEDIATIONACTUALDATE = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LPASITE", x => x.OBJECTID);
                });

            migrationBuilder.CreateTable(
                name: "LPASITE_RELATION",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                columns: table => new
                {
                    OBJECTID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LEFTID = table.Column<int>(type: "int", nullable: false),
                    RIGHTID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LPASITE_RELATION", x => x.OBJECTID);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GFORM_SITE_HIERARCHY_MV",
                schema: Data.Common.Constants.DEFAULT_SCHEMA);

            migrationBuilder.DropTable(
                name: "LPAREMEDIATIONACTSITE",
                schema: Data.Common.Constants.DEFAULT_SCHEMA);

            migrationBuilder.DropTable(
                name: "LPASITE",
                schema: Data.Common.Constants.DEFAULT_SCHEMA);

            migrationBuilder.DropTable(
                name: "LPASITE_RELATION",
                schema: Data.Common.Constants.DEFAULT_SCHEMA);
        }
    }
}
