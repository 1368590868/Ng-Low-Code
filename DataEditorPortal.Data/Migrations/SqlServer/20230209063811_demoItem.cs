using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class demoItem : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "dbo");

            migrationBuilder.CreateTable(
                name: "DemoTables",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FirstName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Checked = table.Column<bool>(type: "bit", nullable: false),
                    Number = table.Column<int>(type: "int", nullable: false),
                    Total = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DemoTables", x => x.Id);
                });

            migrationBuilder.InsertData(
                schema: "dep",
                table: "SiteMenus",
                columns: new[] { "Id", "Description", "Icon", "Label", "Link", "Name", "Order", "ParentId", "Status", "Type" },
                values: new object[] { new Guid("41d85a79-9e84-4ab8-af96-08daf9cd4412"), null, "pi pi-list", "Demo Items", "", "demo", 998, null, 1, "Folder" });

            migrationBuilder.InsertData(
                schema: "dep",
                table: "SitePermissions",
                columns: new[] { "Id", "Category", "PermissionDescription", "PermissionName" },
                values: new object[,]
                {
                    { new Guid("06a315cd-cf13-42cf-8bae-1f6680651b58"), "Portal Item: Demo Item", "View Demo Item", "VIEW_DEMO_ITEM" },
                    { new Guid("804b67e6-ab28-4376-8ce4-98e40515f3b6"), "Portal Item: Demo Item", "Add Demo Item", "ADD_DEMO_ITEM" },
                    { new Guid("33881049-8096-47be-866f-cc686a9bf587"), "Portal Item: Demo Item", "Edit Demo Item", "EDIT_DEMO_ITEM" },
                    { new Guid("3145d3c8-8d13-495d-8dd3-525b3d4eba33"), "Portal Item: Demo Item", "Delete Demo Item", "DELETE_DEMO_ITEM" },
                    { new Guid("155a1215-214b-4a89-acaf-72c48aebb1e9"), "Portal Item: Demo Item", "Export Demo Item", "EXPORT_DEMO_ITEM" }
                });

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "UniversalGridConfigurations",
                keyColumn: "Id",
                keyValue: new Guid("071f5419-85b8-11ed-a86f-0242ac130004"),
                column: "ColumnsConfig",
                value: "[{\"field\":\"Username\",\"header\":\"CNP ID\",\"width\":\"130px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Name\",\"header\":\"Name\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Email\",\"header\":\"Email\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Phone\",\"header\":\"Phone\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"AutoEmail\",\"header\":\"Auto Email\",\"width\":\"250px\",\"filterType\":\"boolean\",\"sortable\":true},{\"field\":\"Vendor\",\"header\":\"Vendor\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Employer\",\"header\":\"Employer\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Division\",\"header\":\"Division\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":false},{\"field\":\"Comments\",\"header\":\"Comments\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true}]");

            migrationBuilder.InsertData(
                schema: "dep",
                table: "UniversalGridConfigurations",
                columns: new[] { "Id", "ColumnsConfig", "ConfigCompleted", "CreatedBy", "CreatedDate", "CurrentStep", "CustomActionConfig", "DataSourceConfig", "DetailConfig", "Name", "SearchConfig" },
                values: new object[] { new Guid("82cfa0d5-1033-4a08-8294-4d4bc2de3d6b"), "[{\"field\":\"Name\",\"header\":\"Name\",\"width\":\"130px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"FirstName\",\"header\":\"First Name\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Checked\",\"header\":\"Checked\",\"width\":\"250px\",\"filterType\":\"boolean\",\"sortable\":true},{\"field\":\"Number\",\"header\":\"Number\",\"width\":\"250px\",\"filterType\":\"numeric\",\"sortable\":true},{\"field\":\"Total\",\"header\":\"Total\",\"width\":\"250px\",\"filterType\":\"numeric\",\"sortable\":true},{\"field\":\"CreateDate\",\"header\":\"Create Date\",\"width\":\"250px\",\"filterType\":\"date\",\"sortable\":false}]", true, new Guid("00000000-0000-0000-0000-000000000000"), new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "[{\"Name\":\"edit-role\"},{\"Name\":\"edit-permission\"},{\"Name\":\"manage-roles\"}]", "{\"TableName\":\"DemoTables\",\"TableSchema\":\"dbo\",\"IdColumn\":\"Id\",\"Columns\":[],\"SortBy\":[]}", "{\"AllowExport\":true,\"AllowDelete\":true,\"AllowEdit\":true,\"UseCustomForm\":true,\"CustomAddFormName\":\"user-manager-add\",\"CustomEditFormName\":\"user-manager-edit\",\"CustomViewFormName\":\"user-manager-view\"}", "demo-item", "[{\"key\":\"FirstName\",\"type\":\"input\",\"filterType\":\"text\",\"props\":{\"label\":\"First Name\",\"placeholder\":\"Enter First Name\"},\"searchRule\":{\"field\":\"FirstName\",\"matchMode\":\"contains\"}},{\"key\":\"Number\",\"type\":\"inputNumber\",\"filterType\":\"numeric\",\"props\":{\"label\":\"Number\",\"placeholder\":\"Enter Number\"},\"searchRule\":{\"field\":\"Number\",\"matchMode\":\"gt\"}},{\"key\":\"Name\",\"type\":\"multiSelect\",\"filterType\":\"text\",\"props\":{\"label\":\"Names\",\"placeholder\":\"Please select\",\"options\":[{\"value\":\"James\",\"label\":\"James\"},{\"value\":\"Robert\",\"label\":\"Robert\"},{\"value\":\"John\",\"label\":\"John\"},{\"value\":\"Michael\",\"label\":\"Michael\"}]},\"searchRule\":{\"field\":\"Name\",\"matchMode\":\"in\"}},{\"key\":\"CreateDate\",\"type\":\"datepicker\",\"filterType\":\"date\",\"props\":{\"label\":\"Create Date\",\"placeholder\":\"Please select\"},\"searchRule\":{\"field\":\"CreateDate\",\"matchMode\":\"gt\"}},{\"key\":\"Checked\",\"type\":\"checkbox\",\"filterType\":\"boolean\",\"props\":{\"label\":\"Checked\"},\"searchRule\":{\"field\":\"Checked\",\"matchMode\":\"equals\"}}]" });

            migrationBuilder.InsertData(
                schema: "dep",
                table: "SiteMenus",
                columns: new[] { "Id", "Description", "Icon", "Label", "Link", "Name", "Order", "ParentId", "Status", "Type" },
                values: new object[] { new Guid("92a804c3-ca4b-4987-5659-08db05b2de84"), null, "pi pi-table", "Demo Item", "", "demo-item", 0, new Guid("41d85a79-9e84-4ab8-af96-08daf9cd4412"), 1, "Portal Item" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DemoTables",
                schema: "dbo");

            migrationBuilder.DeleteData(
                schema: "dep",
                table: "SiteMenus",
                keyColumn: "Id",
                keyValue: new Guid("92a804c3-ca4b-4987-5659-08db05b2de84"));

            migrationBuilder.DeleteData(
                schema: "dep",
                table: "SitePermissions",
                keyColumn: "Id",
                keyValue: new Guid("06a315cd-cf13-42cf-8bae-1f6680651b58"));

            migrationBuilder.DeleteData(
                schema: "dep",
                table: "SitePermissions",
                keyColumn: "Id",
                keyValue: new Guid("155a1215-214b-4a89-acaf-72c48aebb1e9"));

            migrationBuilder.DeleteData(
                schema: "dep",
                table: "SitePermissions",
                keyColumn: "Id",
                keyValue: new Guid("3145d3c8-8d13-495d-8dd3-525b3d4eba33"));

            migrationBuilder.DeleteData(
                schema: "dep",
                table: "SitePermissions",
                keyColumn: "Id",
                keyValue: new Guid("33881049-8096-47be-866f-cc686a9bf587"));

            migrationBuilder.DeleteData(
                schema: "dep",
                table: "SitePermissions",
                keyColumn: "Id",
                keyValue: new Guid("804b67e6-ab28-4376-8ce4-98e40515f3b6"));

            migrationBuilder.DeleteData(
                schema: "dep",
                table: "UniversalGridConfigurations",
                keyColumn: "Id",
                keyValue: new Guid("82cfa0d5-1033-4a08-8294-4d4bc2de3d6b"));

            migrationBuilder.DeleteData(
                schema: "dep",
                table: "SiteMenus",
                keyColumn: "Id",
                keyValue: new Guid("41d85a79-9e84-4ab8-af96-08daf9cd4412"));

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "UniversalGridConfigurations",
                keyColumn: "Id",
                keyValue: new Guid("071f5419-85b8-11ed-a86f-0242ac130004"),
                column: "ColumnsConfig",
                value: "[{\"field\":\"Username\",\"header\":\"CNP ID\",\"width\":\"130px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Name\",\"header\":\"Name\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Email\",\"header\":\"Email\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Phone\",\"header\":\"Phone\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"AutoEmail\",\"header\":\"Auto Email\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Vendor\",\"header\":\"Vendor\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Employer\",\"header\":\"Employer\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Division\",\"header\":\"Division\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":false},{\"field\":\"Comments\",\"header\":\"Comments\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true}]");
        }
    }
}
