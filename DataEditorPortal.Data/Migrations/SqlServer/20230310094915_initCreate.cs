using Microsoft.EntityFrameworkCore.Migrations;
using System;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class initCreate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: Data.Common.Constants.DEFAULT_SCHEMA);

            migrationBuilder.CreateTable(
                name: "DATA_DICTIONARIES",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LABEL = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VALUE = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VALUE1 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VALUE2 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CATEGORY = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DATA_DICTIONARIES", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "DATA_SOURCE_CONNECTIONS",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NAME = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CONNECTION_STRING = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DATA_SOURCE_CONNECTIONS", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "DEMO_TABLE",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    NAME = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FIRST_NAME = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CHECKED = table.Column<bool>(type: "bit", nullable: false),
                    NUMBER = table.Column<int>(type: "int", nullable: false),
                    TOTAL = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    VENDOR = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EMPLOYOR = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DIVISION = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CREATE_DATE = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DEMO_TABLE", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "EVENT_LOGS",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EVENT_TIME = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EVENT_SECTION = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CATEGORY = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EVENT_NAME = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    USERNAME = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DETAILS = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PARAMS = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RESULT = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EVENT_LOGS", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "SITE_MENUS",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NAME = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LABEL = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DESCRIPTION = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ICON = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TYPE = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LINK = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ORDER = table.Column<int>(type: "int", nullable: false),
                    STATUS = table.Column<int>(type: "int", nullable: false),
                    PARENT_ID = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SITE_MENUS", x => x.ID);
                    table.ForeignKey(
                        name: "FK_SITE_MENUS_SITE_MENUS_PARENT_ID",
                        column: x => x.PARENT_ID,
                        principalSchema: Data.Common.Constants.DEFAULT_SCHEMA,
                        principalTable: "SITE_MENUS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SITE_PERMISSIONS",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PERMISSION_NAME = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PERMISSION_DESCRIPTION = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CATEGORY = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SITE_PERMISSIONS", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "SITE_ROLES",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ROLE_NAME = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ROLE_DESCRIPTION = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SITE_ROLES", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "SITE_SETTINGS",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SITE_NAME = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SITE_LOGO = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    INSTALLED = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SITE_SETTINGS", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "USERS",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    USER_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    USERNAME = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EMPLOYER = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    COMMENTS = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NAME = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EMAIL = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VENDOR = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AUTO_EMAIL = table.Column<bool>(type: "bit", nullable: false),
                    USER_TYPE = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PHONE = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_USERS", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "LOOKUPS",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NAME = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QUERY_TEXT = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DATA_SOURCE_CONNECTION_ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LOOKUPS", x => x.ID);
                    table.ForeignKey(
                        name: "FK_LOOKUPS_DATA_SOURCE_CONNECTIONS_DATA_SOURCE_CONNECTION_ID",
                        column: x => x.DATA_SOURCE_CONNECTION_ID,
                        principalSchema: Data.Common.Constants.DEFAULT_SCHEMA,
                        principalTable: "DATA_SOURCE_CONNECTIONS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UNIVERSAL_GRID_CONFIGURATIONS",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NAME = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CURRENT_STEP = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CONFIG_COMPLETED = table.Column<bool>(type: "bit", nullable: false),
                    DATA_SOURCE_CONFIG = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    COLUMNS_CONFIG = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SEARCH_CONFIG = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DETAIL_CONFIG = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CUSTOMACTION_CONFIG = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CREATED_BY = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CREATED_DATE = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DATA_SOURCE_CONNECTION_ID = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UNIVERSAL_GRID_CONFIGURATIONS", x => x.ID);
                    table.ForeignKey(
                        name: "FK_UNIVERSAL_GRID_CONFIGURATIONS_DATA_SOURCE_CONNECTIONS_DATA_SOURCE_CONNECTION_ID",
                        column: x => x.DATA_SOURCE_CONNECTION_ID,
                        principalSchema: Data.Common.Constants.DEFAULT_SCHEMA,
                        principalTable: "DATA_SOURCE_CONNECTIONS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SITE_ROLE_PERMISSIONS",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SITE_PERMISSION_ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SITE_ROLE_ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CREATED_BY = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CREATED_DATE = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SITE_ROLE_PERMISSIONS", x => x.ID);
                    table.ForeignKey(
                        name: "FK_SITE_ROLE_PERMISSIONS_SITE_PERMISSIONS_SITE_PERMISSION_ID",
                        column: x => x.SITE_PERMISSION_ID,
                        principalSchema: Data.Common.Constants.DEFAULT_SCHEMA,
                        principalTable: "SITE_PERMISSIONS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SITE_ROLE_PERMISSIONS_SITE_ROLES_SITE_ROLE_ID",
                        column: x => x.SITE_ROLE_ID,
                        principalSchema: Data.Common.Constants.DEFAULT_SCHEMA,
                        principalTable: "SITE_ROLES",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "USER_PERMISSIONS",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    USER_ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PERMISSION_GRANT_ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CREATED_BY = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CREATED_DATE = table.Column<DateTime>(type: "datetime2", nullable: false),
                    GRANT_TYPE = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_USER_PERMISSIONS", x => x.ID);
                    table.ForeignKey(
                        name: "FK_USER_PERMISSIONS_USERS_USER_ID",
                        column: x => x.USER_ID,
                        principalSchema: Data.Common.Constants.DEFAULT_SCHEMA,
                        principalTable: "USERS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LOOKUPS_DATA_SOURCE_CONNECTION_ID",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "LOOKUPS",
                column: "DATA_SOURCE_CONNECTION_ID");

            migrationBuilder.CreateIndex(
                name: "IX_SITE_MENUS_PARENT_ID",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "SITE_MENUS",
                column: "PARENT_ID");

            migrationBuilder.CreateIndex(
                name: "IX_SITE_ROLE_PERMISSIONS_SITE_PERMISSION_ID",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "SITE_ROLE_PERMISSIONS",
                column: "SITE_PERMISSION_ID");

            migrationBuilder.CreateIndex(
                name: "IX_SITE_ROLE_PERMISSIONS_SITE_ROLE_ID",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "SITE_ROLE_PERMISSIONS",
                column: "SITE_ROLE_ID");

            migrationBuilder.CreateIndex(
                name: "IX_UNIVERSAL_GRID_CONFIGURATIONS_DATA_SOURCE_CONNECTION_ID",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "UNIVERSAL_GRID_CONFIGURATIONS",
                column: "DATA_SOURCE_CONNECTION_ID");

            migrationBuilder.CreateIndex(
                name: "IX_USER_PERMISSIONS_USER_ID",
                schema: Data.Common.Constants.DEFAULT_SCHEMA,
                table: "USER_PERMISSIONS",
                column: "USER_ID");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DATA_DICTIONARIES",
                schema: Data.Common.Constants.DEFAULT_SCHEMA);

            migrationBuilder.DropTable(
                name: "DEMO_TABLE",
                schema: Data.Common.Constants.DEFAULT_SCHEMA);

            migrationBuilder.DropTable(
                name: "EVENT_LOGS",
                schema: Data.Common.Constants.DEFAULT_SCHEMA);

            migrationBuilder.DropTable(
                name: "LOOKUPS",
                schema: Data.Common.Constants.DEFAULT_SCHEMA);

            migrationBuilder.DropTable(
                name: "SITE_MENUS",
                schema: Data.Common.Constants.DEFAULT_SCHEMA);

            migrationBuilder.DropTable(
                name: "SITE_ROLE_PERMISSIONS",
                schema: Data.Common.Constants.DEFAULT_SCHEMA);

            migrationBuilder.DropTable(
                name: "SITE_SETTINGS",
                schema: Data.Common.Constants.DEFAULT_SCHEMA);

            migrationBuilder.DropTable(
                name: "UNIVERSAL_GRID_CONFIGURATIONS",
                schema: Data.Common.Constants.DEFAULT_SCHEMA);

            migrationBuilder.DropTable(
                name: "USER_PERMISSIONS",
                schema: Data.Common.Constants.DEFAULT_SCHEMA);

            migrationBuilder.DropTable(
                name: "SITE_PERMISSIONS",
                schema: Data.Common.Constants.DEFAULT_SCHEMA);

            migrationBuilder.DropTable(
                name: "SITE_ROLES",
                schema: Data.Common.Constants.DEFAULT_SCHEMA);

            migrationBuilder.DropTable(
                name: "DATA_SOURCE_CONNECTIONS",
                schema: Data.Common.Constants.DEFAULT_SCHEMA);

            migrationBuilder.DropTable(
                name: "USERS",
                schema: Data.Common.Constants.DEFAULT_SCHEMA);
        }
    }
}
