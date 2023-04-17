using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.Oracle
{
    public partial class LPADemo : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GFORM_SITE_HIERARCHY_MV",
                schema: "DATA_EDITOR_PORTAL",
                columns: table => new
                {
                    HIERARCHY_GLOBALID = table.Column<string>(type: "NVARCHAR2(450)", nullable: false),
                    DOT_OPERATOR_NAME = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    SITETYPE = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    SITENAME = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    DIVISION_NAME = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    AREA_NAME = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    LOCATION = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GFORM_SITE_HIERARCHY_MV", x => x.HIERARCHY_GLOBALID);
                });

            migrationBuilder.CreateTable(
                name: "LPAREMEDIATIONACTSITE",
                schema: "DATA_EDITOR_PORTAL",
                columns: table => new
                {
                    OBJECTID = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    CREATIONUSER = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    DATECREATED = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: true),
                    DATEMODIFIED = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: true),
                    LASTUSER = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    GLOBALID = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    EVENTID = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    BOUNDARYGLOBALID = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    FEATUREGLOBALID = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    STATUS = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    TYPE = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    LPAACTIVITYSTATUS = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    COMMENTS = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    ASSIGNEDTO = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    REMEDIATIONPROPOSEDDATE = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: true),
                    REMEDIATIONACTUALDATE = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LPAREMEDIATIONACTSITE", x => x.OBJECTID);
                });

            migrationBuilder.CreateTable(
                name: "LPASITE",
                schema: "DATA_EDITOR_PORTAL",
                columns: table => new
                {
                    OBJECTID = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    CREATIONUSER = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    DATECREATED = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: true),
                    DATEMODIFIED = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: true),
                    LASTUSER = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    GLOBALID = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    EVENTID = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    BOUNDARYGLOBALID = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    FEATUREGLOBALID = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    STATUS = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    LPANAME = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    TYPE = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    LPASTATUS = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    COMMENTS = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    DISCOVERYDATE = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: true),
                    D40CRITERIA = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    ASSESSEDBY = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    REQREMEDIATIONDATE = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: true),
                    REMEDIATIONPROPOSEDDATE = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: true),
                    REMEDIATIONACTUALDATE = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LPASITE", x => x.OBJECTID);
                });

            migrationBuilder.CreateTable(
                name: "LPASITE_RELATION",
                schema: "DATA_EDITOR_PORTAL",
                columns: table => new
                {
                    OBJECTID = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    LEFTID = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    RIGHTID = table.Column<int>(type: "NUMBER(10)", nullable: false)
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
                schema: "DATA_EDITOR_PORTAL");

            migrationBuilder.DropTable(
                name: "LPAREMEDIATIONACTSITE",
                schema: "DATA_EDITOR_PORTAL");

            migrationBuilder.DropTable(
                name: "LPASITE",
                schema: "DATA_EDITOR_PORTAL");

            migrationBuilder.DropTable(
                name: "LPASITE_RELATION",
                schema: "DATA_EDITOR_PORTAL");
        }
    }
}
