using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class setInitialData : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "UniversalGridConfigurations",
                keyColumn: "Id",
                keyValue: new Guid("071f5419-85b8-11ed-a86f-0242ac130004"),
                columns: new[] { "ColumnsConfig", "ConfigCompleted", "DataSourceConfig", "DetailConfig", "Name", "SearchConfig" },
                values: new object[] { "[{\"field\":\"Username\",\"header\":\"CNP ID\",\"width\":\"130px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Name\",\"header\":\"Name\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Email\",\"header\":\"Email\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Phone\",\"header\":\"Phone\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"AutoEmail\",\"header\":\"Auto Email\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Vendor\",\"header\":\"Vendor\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Employer\",\"header\":\"Employer\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Division\",\"header\":\"Division\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":false},{\"field\":\"Comments\",\"header\":\"Comments\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true}]", true, "{\"TableName\":\"Users\",\"TableSchema\":\"dep\",\"IdColumn\":\"Id\",\"Columns\":[\"Id\",\"Username\",\"Name\",\"Email\",\"Phone\",\"AutoEmail\",\"Vendor\",\"Employer\",\"Division\",\"Comments\"],\"SortBy\":[{\"field\":\"Name\",\"order\":1}]}", "{\"AllowExport\":true,\"AllowDelete\":true,\"AllowEdit\":true,\"UseCustomForm\":true,\"CustomAddFormName\":\"user-manager-add\",\"CustomEditFormName\":\"user-manager-edit\",\"CustomViewFormName\":\"user-manager-view\"}", "user-management", "[{\"key\":\"username\",\"type\":\"input\",\"filterType\":\"text\",\"props\":{\"label\":\"CNP ID\",\"placeholder\":\"CNP ID\"},\"searchRule\":{\"field\":\"Username\",\"matchMode\":\"contains\"}},{\"key\":\"name\",\"type\":\"input\",\"filterType\":\"text\",\"props\":{\"label\":\"Name\",\"placeholder\":\"Name\"},\"searchRule\":{\"field\":\"Name\",\"matchMode\":\"contains\"}},{\"key\":\"roles\",\"type\":\"select\",\"filterType\":\"text\",\"props\":{\"label\":\"Roles\",\"placeholder\":\"Please select\",\"options\":[{\"value\":1,\"label\":\"Option 1\"},{\"value\":2,\"label\":\"Option 2\"},{\"value\":3,\"label\":\"Option 3\"},{\"value\":4,\"label\":\"Option 4\"}]},\"searchRule\":{\"whereClause\":\"Id in (select UserId from USERID_PERMISSION where PERMISSION_GRANT_ID = \\u0027{0}\\u0027)\"}},{\"key\":\"vendor\",\"type\":\"select\",\"filterType\":\"text\",\"props\":{\"label\":\"Vendor\",\"placeholder\":\"Please select\",\"options\":[{\"value\":1,\"label\":\"Option 1\"},{\"value\":2,\"label\":\"Option 2\"},{\"value\":3,\"label\":\"Option 3\"},{\"value\":4,\"label\":\"Option 4\"}]},\"searchRule\":{\"field\":\"Vendor\",\"matchMode\":\"contains\"}},{\"key\":\"employer\",\"type\":\"select\",\"filterType\":\"text\",\"props\":{\"label\":\"Employer\",\"placeholder\":\"Please select\",\"options\":[{\"value\":1,\"label\":\"Option 1\"},{\"value\":2,\"label\":\"Option 2\"},{\"value\":3,\"label\":\"Option 3\"},{\"value\":4,\"label\":\"Option 4\"}]},\"searchRule\":{\"field\":\"Employer\",\"matchMode\":\"contains\"}}]" });

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "SiteMenus",
                keyColumn: "Id",
                keyValue: new Guid("4e22e18e-492e-4786-8170-fb8f0c9d3a62"),
                columns: new[] { "Icon", "Link", "Name", "Order", "ParentId", "Status", "Type" },
                values: new object[] { "pi pi-user", "", "user-management", 1, new Guid("b82dfe59-e51a-4771-b876-05d62f4207e3"), 1, "System" });

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "SiteMenus",
                keyColumn: "Id",
                keyValue: new Guid("b4b490ea-9df3-4f7a-8806-936ca7f87b8f"),
                columns: new[] { "Name", "ParentId", "Status", "Type" },
                values: new object[] { "portal-management", new Guid("b82dfe59-e51a-4771-b876-05d62f4207e3"), 1, "System" });

            migrationBuilder.InsertData(
                schema: "dep",
                table: "SiteMenus",
                columns: new[] { "Id", "Description", "Icon", "Label", "Link", "Name", "Order", "ParentId", "Status", "Type" },
                values: new object[] { new Guid("cbf29ec9-b605-45f1-a84f-5a7fc99ad6b3"), null, "pi pi-wrench", "Site Settings", "", "site-settings", 2, new Guid("b82dfe59-e51a-4771-b876-05d62f4207e3"), 1, "System" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                schema: "dep",
                table: "SiteMenus",
                keyColumn: "Id",
                keyValue: new Guid("cbf29ec9-b605-45f1-a84f-5a7fc99ad6b3"));

            migrationBuilder.DeleteData(
                schema: "dep",
                table: "SiteRoles",
                keyColumn: "Id",
                keyValue: new Guid("33d70a90-0c4c-48ee-ad8f-3051448d19cf"));

            migrationBuilder.DeleteData(
                schema: "dep",
                table: "SiteMenus",
                keyColumn: "Id",
                keyValue: new Guid("b82dfe59-e51a-4771-b876-05d62f4207e3"));

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "SiteMenus",
                keyColumn: "Id",
                keyValue: new Guid("4e22e18e-492e-4786-8170-fb8f0c9d3a62"),
                columns: new[] { "Icon", "Link", "Name", "Order", "ParentId", "Status", "Type" },
                values: new object[] { "pi pi-fw pi-user", null, "UserManagement", 0, null, 0, "PortalItem" });

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "SiteMenus",
                keyColumn: "Id",
                keyValue: new Guid("b4b490ea-9df3-4f7a-8806-936ca7f87b8f"),
                columns: new[] { "Name", "ParentId", "Status", "Type" },
                values: new object[] { "PortalManagement", null, 0, "" });

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "UniversalGridConfigurations",
                keyColumn: "Id",
                keyValue: new Guid("071f5419-85b8-11ed-a86f-0242ac130004"),
                columns: new[] { "ColumnsConfig", "ConfigCompleted", "DataSourceConfig", "DetailConfig", "Name", "SearchConfig" },
                values: new object[] { "[{\"field\":\"Username\",\"header\":\"CNP ID\",\"width\":\"130px\",\"filterType\":\"text\"},{\"field\":\"Name\",\"header\":\"Name\",\"width\":\"250px\",\"filterType\":\"text\"},{\"field\":\"Email\",\"header\":\"Email\",\"width\":\"250px\",\"filterType\":\"text\"},{\"field\":\"Phone\",\"header\":\"Phone\",\"width\":\"250px\",\"filterType\":\"text\"},{\"field\":\"AutoEmail\",\"header\":\"Auto Email\",\"width\":\"250px\",\"filterType\":\"text\"},{\"field\":\"Vendor\",\"header\":\"Vendor\",\"width\":\"250px\",\"filterType\":\"text\"},{\"field\":\"Employer\",\"header\":\"Employer\",\"width\":\"250px\",\"filterType\":\"text\"},{\"field\":\"Division\",\"header\":\"Division\",\"width\":\"250px\",\"filterType\":\"text\"},{\"field\":\"Comments\",\"header\":\"Comments\",\"width\":\"250px\",\"filterType\":\"text\"}]", false, "{\"TableName\":\"Users\",\"IdColumn\":\"Id\",\"Columns\":[\"Id\",\"Username\",\"Name\",\"Email\",\"Phone\",\"AutoEmail\",\"Vendor\",\"Employer\",\"Division\",\"Comments\"],\"SortBy\":[{\"field\":\"Name\",\"order\":1}]}", "{\"UseCustomAction\":false,\"FormConfig\":[{\"key\":\"Username\",\"type\":\"input\",\"props\":{\"label\":\"CNP ID\",\"placeholder\":\"CNP ID\",\"required\":true}},{\"key\":\"Name\",\"type\":\"input\",\"props\":{\"label\":\"Name\",\"placeholder\":\"Name\",\"required\":true}},{\"key\":\"Email\",\"type\":\"input\",\"props\":{\"label\":\"Email\",\"placeholder\":\"Email\",\"required\":true}},{\"key\":\"Phone\",\"type\":\"input\",\"props\":{\"label\":\"Phone\",\"placeholder\":\"Phone\",\"required\":true}},{\"key\":\"Vendor\",\"type\":\"input\",\"props\":{\"label\":\"Vendor\",\"placeholder\":\"Vendor\"}},{\"key\":\"Employer\",\"type\":\"input\",\"props\":{\"label\":\"Employer\",\"placeholder\":\"Employer\"}},{\"key\":\"AutoEmail\",\"type\":\"checkbox\",\"defaultValue\":true,\"props\":{\"label\":\"Auto Email\",\"required\":true}}]}", "UserManagement", "[{\"key\":\"username\",\"type\":\"input\",\"props\":{\"label\":\"CNP ID\",\"placeholder\":\"CNP ID\"},\"searchRule\":{\"field\":\"Username\",\"matchMode\":\"contains\"}},{\"key\":\"name\",\"type\":\"input\",\"props\":{\"label\":\"Name\",\"placeholder\":\"Name\"},\"searchRule\":{\"field\":\"Name\",\"matchMode\":\"contains\"}},{\"key\":\"roles\",\"type\":\"select\",\"props\":{\"label\":\"Roles\",\"placeholder\":\"Please select\",\"options\":[{\"value\":1,\"label\":\"Option 1\"},{\"value\":2,\"label\":\"Option 2\"},{\"value\":3,\"label\":\"Option 3\"},{\"value\":4,\"label\":\"Option 4\"}]},\"searchRule\":{\"whereClause\":\"Id in (select UserId from USERID_PERMISSION where PERMISSION_GRANT_ID = \\u0027{0}\\u0027)\"}},{\"key\":\"vendor\",\"type\":\"select\",\"props\":{\"label\":\"Vendor\",\"placeholder\":\"Please select\",\"options\":[{\"value\":1,\"label\":\"Option 1\"},{\"value\":2,\"label\":\"Option 2\"},{\"value\":3,\"label\":\"Option 3\"},{\"value\":4,\"label\":\"Option 4\"}]},\"searchRule\":{\"field\":\"Vendor\",\"matchMode\":\"contains\"}},{\"key\":\"employer\",\"type\":\"select\",\"props\":{\"label\":\"Employer\",\"placeholder\":\"Please select\",\"options\":[{\"value\":1,\"label\":\"Option 1\"},{\"value\":2,\"label\":\"Option 2\"},{\"value\":3,\"label\":\"Option 3\"},{\"value\":4,\"label\":\"Option 4\"}]},\"searchRule\":{\"field\":\"Employer\",\"matchMode\":\"contains\"}}]" });
        }
    }
}
