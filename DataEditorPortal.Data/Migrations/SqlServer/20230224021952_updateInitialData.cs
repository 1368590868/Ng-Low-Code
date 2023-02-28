using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class updateInitialData : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                schema: "dep",
                table: "SiteMenus",
                columns: new[] { "Id", "Description", "Icon", "Label", "Link", "Name", "Order", "ParentId", "Status", "Type" },
                values: new object[] { new Guid("b0864169-8ca1-49e4-ae1e-bfc53756231b"), null, "pi pi-clock", "System Event Logs", "/system-event-logs", "site-settings", 4, new Guid("b82dfe59-e51a-4771-b876-05d62f4207e3"), 1, "System" });

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "UniversalGridConfigurations",
                keyColumn: "Id",
                keyValue: new Guid("071f5419-85b8-11ed-a86f-0242ac130004"),
                columns: new[] { "ColumnsConfig", "DetailConfig" },
                values: new object[] { "[{\"type\":\"DataBaseField\",\"field\":\"Username\",\"header\":\"CNP ID\",\"width\":\"130px\",\"filterType\":\"text\",\"sortable\":true},{\"type\":\"DataBaseField\",\"field\":\"Name\",\"header\":\"Name\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"type\":\"DataBaseField\",\"field\":\"Email\",\"header\":\"Email\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"type\":\"DataBaseField\",\"field\":\"Phone\",\"header\":\"Phone\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"type\":\"DataBaseField\",\"field\":\"AutoEmail\",\"header\":\"Auto Email\",\"width\":\"250px\",\"filterType\":\"boolean\",\"sortable\":true},{\"type\":\"DataBaseField\",\"field\":\"Vendor\",\"header\":\"Vendor\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"type\":\"DataBaseField\",\"field\":\"Employer\",\"header\":\"Employer\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"type\":\"DataBaseField\",\"field\":\"Division\",\"header\":\"Division\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":false},{\"type\":\"DataBaseField\",\"field\":\"Comments\",\"header\":\"Comments\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true}]", "{\"AddingForm\":{\"UseCustomForm\":true,\"CustomFormName\":\"user-manager-add\"},\"UpdatingForm\":{\"UseCustomForm\":true,\"CustomFormName\":\"user-manager-edit\"}}" });

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "UniversalGridConfigurations",
                keyColumn: "Id",
                keyValue: new Guid("82cfa0d5-1033-4a08-8294-4d4bc2de3d6b"),
                columns: new[] { "ColumnsConfig", "DetailConfig" },
                values: new object[] { "[{\"type\":\"DataBaseField\",\"field\":\"Name\",\"header\":\"Name\",\"width\":\"130px\",\"filterType\":\"text\",\"sortable\":true},{\"type\":\"DataBaseField\",\"field\":\"FirstName\",\"header\":\"First Name\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"type\":\"DataBaseField\",\"field\":\"Checked\",\"header\":\"Checked\",\"width\":\"250px\",\"filterType\":\"boolean\",\"sortable\":false},{\"type\":\"DataBaseField\",\"field\":\"Number\",\"header\":\"Number\",\"width\":\"250px\",\"filterType\":\"numeric\",\"sortable\":true},{\"type\":\"DataBaseField\",\"field\":\"Total\",\"header\":\"Total\",\"width\":\"250px\",\"filterType\":\"numeric\",\"sortable\":true},{\"type\":\"DataBaseField\",\"field\":\"CreateDate\",\"header\":\"Create Date\",\"width\":\"250px\",\"filterType\":\"date\",\"sortable\":true}]", "{\"AddingForm\":{\"UseCustomForm\":false,\"FormFields\":[{\"filterType\":\"text\",\"key\":\"Name\",\"type\":\"input\",\"props\":{\"label\":\"Name\",\"required\":true}},{\"filterType\":\"text\",\"key\":\"FirstName\",\"type\":\"input\",\"props\":{\"label\":\"First Name\",\"required\":true}},{\"filterType\":\"boolean\",\"key\":\"Checked\",\"type\":\"checkbox\",\"props\":{\"label\":\"Checked\",\"required\":true}},{\"filterType\":\"numeric\",\"key\":\"Number\",\"type\":\"inputNumber\",\"props\":{\"label\":\"Number\",\"maxFractionDigits\":0,\"required\":true}},{\"filterType\":\"numeric\",\"key\":\"Total\",\"type\":\"inputNumber\",\"props\":{\"label\":\"Total\",\"required\":true}},{\"filterType\":\"date\",\"key\":\"CreateDate\",\"type\":\"datepicker\",\"props\":{\"label\":\"Create Date\",\"required\":true}}]},\"UpdatingForm\":{\"UseAddingFormLayout\":true}}" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                schema: "dep",
                table: "SiteMenus",
                keyColumn: "Id",
                keyValue: new Guid("b0864169-8ca1-49e4-ae1e-bfc53756231b"));

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "UniversalGridConfigurations",
                keyColumn: "Id",
                keyValue: new Guid("071f5419-85b8-11ed-a86f-0242ac130004"),
                columns: new[] { "ColumnsConfig", "DetailConfig" },
                values: new object[] { "[{\"field\":\"Username\",\"header\":\"CNP ID\",\"width\":\"130px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Name\",\"header\":\"Name\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Email\",\"header\":\"Email\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Phone\",\"header\":\"Phone\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"AutoEmail\",\"header\":\"Auto Email\",\"width\":\"250px\",\"filterType\":\"boolean\",\"sortable\":true},{\"field\":\"Vendor\",\"header\":\"Vendor\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Employer\",\"header\":\"Employer\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Division\",\"header\":\"Division\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":false},{\"field\":\"Comments\",\"header\":\"Comments\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true}]", "{\"AllowExport\":true,\"AllowDelete\":true,\"AllowEdit\":true,\"UseCustomForm\":true,\"CustomAddFormName\":\"user-manager-add\",\"CustomEditFormName\":\"user-manager-edit\",\"CustomViewFormName\":\"user-manager-view\"}" });

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "UniversalGridConfigurations",
                keyColumn: "Id",
                keyValue: new Guid("82cfa0d5-1033-4a08-8294-4d4bc2de3d6b"),
                columns: new[] { "ColumnsConfig", "DetailConfig" },
                values: new object[] { "[{\"field\":\"Name\",\"header\":\"Name\",\"width\":\"130px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"FirstName\",\"header\":\"First Name\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Checked\",\"header\":\"Checked\",\"width\":\"250px\",\"filterType\":\"boolean\",\"sortable\":false},{\"field\":\"Number\",\"header\":\"Number\",\"width\":\"250px\",\"filterType\":\"numeric\",\"sortable\":true},{\"field\":\"Total\",\"header\":\"Total\",\"width\":\"250px\",\"filterType\":\"numeric\",\"sortable\":true},{\"field\":\"CreateDate\",\"header\":\"Create Date\",\"width\":\"250px\",\"filterType\":\"date\",\"sortable\":true}]", "{\"AllowExport\":true,\"AllowDelete\":true,\"AllowEdit\":true,\"UseCustomForm\":false,\"FormFields\":[{\"filterType\":\"text\",\"key\":\"Name\",\"type\":\"input\",\"props\":{\"label\":\"Name\",\"required\":true}},{\"filterType\":\"text\",\"key\":\"FirstName\",\"type\":\"input\",\"props\":{\"label\":\"First Name\",\"required\":true}},{\"filterType\":\"boolean\",\"key\":\"Checked\",\"type\":\"checkbox\",\"props\":{\"label\":\"Checked\",\"required\":true}},{\"filterType\":\"numeric\",\"key\":\"Number\",\"type\":\"inputNumber\",\"props\":{\"label\":\"Number\",\"maxFractionDigits\":0,\"required\":true}},{\"filterType\":\"numeric\",\"key\":\"Total\",\"type\":\"inputNumber\",\"props\":{\"label\":\"Total\",\"required\":true}},{\"filterType\":\"date\",\"key\":\"CreateDate\",\"type\":\"datepicker\",\"props\":{\"label\":\"Create Date\",\"required\":true}}]}" });
        }
    }
}
