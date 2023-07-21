using Microsoft.EntityFrameworkCore.Migrations;
using System;

namespace DataEditorPortal.Data.Migrations.Oracle
{
    public partial class LPADemo : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DEMO_LINK_LOOKUP",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                columns: table => new
                {
                    LOOKUPID = table.Column<string>(type: "NVARCHAR2(450)", nullable: false),
                    NAME1 = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    NAME2 = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    NAME3 = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    NAME4 = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    NAME5 = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    NAME6 = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GFORM_SITE_HIERARCHY_MV", x => x.LOOKUPID);
                });

            migrationBuilder.CreateTable(
                name: "DEMO_LINK_SECONDARY",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
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
                    STATUS1 = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    COMMENTS = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    ASSIGNEDTO = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    DATETIME3 = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: true),
                    DATETIME4 = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LPAREMEDIATIONACTSITE", x => x.OBJECTID);
                });

            migrationBuilder.CreateTable(
                name: "DEMO_LINK_PRIMARY",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
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
                    NAME = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    TYPE = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    STATUS1 = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    COMMENTS = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    DATETIME1 = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: true),
                    CRITERIA = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    ASSESSEDBY = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    DATETIME2 = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: true),
                    DATETIME3 = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: true),
                    DATETIME4 = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LPASITE", x => x.OBJECTID);
                });

            migrationBuilder.CreateTable(
                name: "DEMO_LINK_RELATION",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
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
                name: "DEMO_LINK_LOOKUP",
                schema: Data.Common.Constants.DEFAULT_SCHEMA);

            migrationBuilder.DropTable(
                name: "DEMO_LINK_SECONDARY",
                schema: Data.Common.Constants.DEFAULT_SCHEMA);

            migrationBuilder.DropTable(
                name: "DEMO_LINK_PRIMARY",
                schema: Data.Common.Constants.DEFAULT_SCHEMA);

            migrationBuilder.DropTable(
                name: "DEMO_LINK_RELATION",
                schema: Data.Common.Constants.DEFAULT_SCHEMA);
        }
    }
}
