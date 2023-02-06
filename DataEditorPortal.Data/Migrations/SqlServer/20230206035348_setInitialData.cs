using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class setInitialData : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "dep");

            migrationBuilder.CreateTable(
                name: "Lookups",
                schema: "dep",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QueryText = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Lookups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SiteMenus",
                schema: "dep",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Label = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Icon = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Link = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Order = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ParentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SiteMenus", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SiteMenus_SiteMenus_ParentId",
                        column: x => x.ParentId,
                        principalSchema: "dep",
                        principalTable: "SiteMenus",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SitePermissions",
                schema: "dep",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PermissionName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PermissionDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SitePermissions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SiteRoles",
                schema: "dep",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RoleName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RoleDescription = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SiteRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UniversalGridConfigurations",
                schema: "dep",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CurrentStep = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConfigCompleted = table.Column<bool>(type: "bit", nullable: false),
                    DataSourceConfig = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ColumnsConfig = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SearchConfig = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DetailConfig = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UniversalGridConfigurations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                schema: "dep",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    Username = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Employer = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Comments = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Division = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Vendor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AutoEmail = table.Column<bool>(type: "bit", nullable: false),
                    UserType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SiteRolePermissions",
                schema: "dep",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SitePermissionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SiteRoleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SiteRolePermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SiteRolePermissions_SitePermissions_SitePermissionId",
                        column: x => x.SitePermissionId,
                        principalSchema: "dep",
                        principalTable: "SitePermissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SiteRolePermissions_SiteRoles_SiteRoleId",
                        column: x => x.SiteRoleId,
                        principalSchema: "dep",
                        principalTable: "SiteRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserPermissions",
                schema: "dep",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PermissionGrantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    GrantType = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserPermissions_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "dep",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                schema: "dep",
                table: "SiteMenus",
                columns: new[] { "Id", "Description", "Icon", "Label", "Link", "Name", "Order", "ParentId", "Status", "Type" },
                values: new object[] { new Guid("b82dfe59-e51a-4771-b876-05d62f4207e3"), null, "pi pi-cog", "Settings", "", "settings", 999, null, 1, "System" });

            migrationBuilder.InsertData(
                schema: "dep",
                table: "SiteRoles",
                columns: new[] { "Id", "RoleDescription", "RoleName" },
                values: new object[] { new Guid("33d70a90-0c4c-48ee-ad8f-3051448d19cf"), null, "Users" });

            migrationBuilder.InsertData(
                schema: "dep",
                table: "UniversalGridConfigurations",
                columns: new[] { "Id", "ColumnsConfig", "ConfigCompleted", "CreatedBy", "CreatedDate", "CurrentStep", "DataSourceConfig", "DetailConfig", "Name", "SearchConfig" },
                values: new object[] { new Guid("071f5419-85b8-11ed-a86f-0242ac130004"), "[{\"field\":\"Username\",\"header\":\"CNP ID\",\"width\":\"130px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Name\",\"header\":\"Name\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Email\",\"header\":\"Email\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Phone\",\"header\":\"Phone\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"AutoEmail\",\"header\":\"Auto Email\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Vendor\",\"header\":\"Vendor\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Employer\",\"header\":\"Employer\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Division\",\"header\":\"Division\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":false},{\"field\":\"Comments\",\"header\":\"Comments\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true}]", true, new Guid("00000000-0000-0000-0000-000000000000"), new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "{\"TableName\":\"Users\",\"TableSchema\":\"dep\",\"IdColumn\":\"Id\",\"Columns\":[\"Id\",\"Username\",\"Name\",\"Email\",\"Phone\",\"AutoEmail\",\"Vendor\",\"Employer\",\"Division\",\"Comments\"],\"SortBy\":[{\"field\":\"Name\",\"order\":1}]}", "{\"AllowExport\":true,\"AllowDelete\":true,\"AllowEdit\":true,\"UseCustomForm\":true,\"CustomAddFormName\":\"user-manager-add\",\"CustomEditFormName\":\"user-manager-edit\",\"CustomViewFormName\":\"user-manager-view\"}", "user-management", "[{\"key\":\"username\",\"type\":\"input\",\"filterType\":\"text\",\"props\":{\"label\":\"CNP ID\",\"placeholder\":\"CNP ID\"},\"searchRule\":{\"field\":\"Username\",\"matchMode\":\"contains\"}},{\"key\":\"name\",\"type\":\"input\",\"filterType\":\"text\",\"props\":{\"label\":\"Name\",\"placeholder\":\"Name\"},\"searchRule\":{\"field\":\"Name\",\"matchMode\":\"contains\"}},{\"key\":\"roles\",\"type\":\"select\",\"filterType\":\"text\",\"props\":{\"label\":\"Roles\",\"placeholder\":\"Please select\",\"options\":[{\"value\":1,\"label\":\"Option 1\"},{\"value\":2,\"label\":\"Option 2\"},{\"value\":3,\"label\":\"Option 3\"},{\"value\":4,\"label\":\"Option 4\"}]},\"searchRule\":{\"whereClause\":\"Id in (select UserId from USERID_PERMISSION where PERMISSION_GRANT_ID = \\u0027{0}\\u0027)\"}},{\"key\":\"vendor\",\"type\":\"select\",\"filterType\":\"text\",\"props\":{\"label\":\"Vendor\",\"placeholder\":\"Please select\",\"options\":[{\"value\":1,\"label\":\"Option 1\"},{\"value\":2,\"label\":\"Option 2\"},{\"value\":3,\"label\":\"Option 3\"},{\"value\":4,\"label\":\"Option 4\"}]},\"searchRule\":{\"field\":\"Vendor\",\"matchMode\":\"contains\"}},{\"key\":\"employer\",\"type\":\"select\",\"filterType\":\"text\",\"props\":{\"label\":\"Employer\",\"placeholder\":\"Please select\",\"options\":[{\"value\":1,\"label\":\"Option 1\"},{\"value\":2,\"label\":\"Option 2\"},{\"value\":3,\"label\":\"Option 3\"},{\"value\":4,\"label\":\"Option 4\"}]},\"searchRule\":{\"field\":\"Employer\",\"matchMode\":\"contains\"}}]" });

            migrationBuilder.InsertData(
                schema: "dep",
                table: "SiteMenus",
                columns: new[] { "Id", "Description", "Icon", "Label", "Link", "Name", "Order", "ParentId", "Status", "Type" },
                values: new object[] { new Guid("b4b490ea-9df3-4f7a-8806-936ca7f87b8f"), null, "pi pi-desktop", "Portal Management", "/portal-management/list", "portal-management", 0, new Guid("b82dfe59-e51a-4771-b876-05d62f4207e3"), 1, "System" });

            migrationBuilder.InsertData(
                schema: "dep",
                table: "SiteMenus",
                columns: new[] { "Id", "Description", "Icon", "Label", "Link", "Name", "Order", "ParentId", "Status", "Type" },
                values: new object[] { new Guid("4e22e18e-492e-4786-8170-fb8f0c9d3a62"), null, "pi pi-user", "User Management", "/portal-item/user-management", "user-management", 1, new Guid("b82dfe59-e51a-4771-b876-05d62f4207e3"), 1, "System" });

            migrationBuilder.InsertData(
                schema: "dep",
                table: "SiteMenus",
                columns: new[] { "Id", "Description", "Icon", "Label", "Link", "Name", "Order", "ParentId", "Status", "Type" },
                values: new object[] { new Guid("cbf29ec9-b605-45f1-a84f-5a7fc99ad6b3"), null, "pi pi-wrench", "Site Settings", "", "site-settings", 2, new Guid("b82dfe59-e51a-4771-b876-05d62f4207e3"), 1, "System" });

            migrationBuilder.CreateIndex(
                name: "IX_SiteMenus_ParentId",
                schema: "dep",
                table: "SiteMenus",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_SiteRolePermissions_SitePermissionId",
                schema: "dep",
                table: "SiteRolePermissions",
                column: "SitePermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_SiteRolePermissions_SiteRoleId",
                schema: "dep",
                table: "SiteRolePermissions",
                column: "SiteRoleId");

            migrationBuilder.CreateIndex(
                name: "IX_UserPermissions_UserId",
                schema: "dep",
                table: "UserPermissions",
                column: "UserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Lookups",
                schema: "dep");

            migrationBuilder.DropTable(
                name: "SiteMenus",
                schema: "dep");

            migrationBuilder.DropTable(
                name: "SiteRolePermissions",
                schema: "dep");

            migrationBuilder.DropTable(
                name: "UniversalGridConfigurations",
                schema: "dep");

            migrationBuilder.DropTable(
                name: "UserPermissions",
                schema: "dep");

            migrationBuilder.DropTable(
                name: "SitePermissions",
                schema: "dep");

            migrationBuilder.DropTable(
                name: "SiteRoles",
                schema: "dep");

            migrationBuilder.DropTable(
                name: "Users",
                schema: "dep");
        }
    }
}
