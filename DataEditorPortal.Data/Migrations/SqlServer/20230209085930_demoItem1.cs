using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class demoItem1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                schema: "dbo",
                table: "DemoTables",
                type: "uniqueidentifier",
                nullable: false,
                defaultValueSql: "NEWID()",
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "UniversalGridConfigurations",
                keyColumn: "Id",
                keyValue: new Guid("82cfa0d5-1033-4a08-8294-4d4bc2de3d6b"),
                columns: new[] { "ColumnsConfig", "CustomActionConfig", "DetailConfig", "SearchConfig" },
                values: new object[] { "[{\"field\":\"Name\",\"header\":\"Name\",\"width\":\"130px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"FirstName\",\"header\":\"First Name\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Checked\",\"header\":\"Checked\",\"width\":\"250px\",\"filterType\":\"boolean\",\"sortable\":false},{\"field\":\"Number\",\"header\":\"Number\",\"width\":\"250px\",\"filterType\":\"numeric\",\"sortable\":true},{\"field\":\"Total\",\"header\":\"Total\",\"width\":\"250px\",\"filterType\":\"numeric\",\"sortable\":true},{\"field\":\"CreateDate\",\"header\":\"Create Date\",\"width\":\"250px\",\"filterType\":\"date\",\"sortable\":true}]", "[]", "{\"AllowExport\":true,\"AllowDelete\":true,\"AllowEdit\":true,\"UseCustomForm\":false,\"FormFields\":[{\"filterType\":\"text\",\"key\":\"Name\",\"type\":\"input\",\"props\":{\"label\":\"Name\",\"required\":true}},{\"filterType\":\"text\",\"key\":\"FirstName\",\"type\":\"input\",\"props\":{\"label\":\"First Name\",\"required\":true}},{\"filterType\":\"boolean\",\"key\":\"Checked\",\"type\":\"checkbox\",\"props\":{\"label\":\"Checked\",\"required\":true}},{\"filterType\":\"numeric\",\"key\":\"Number\",\"type\":\"inputNumber\",\"props\":{\"label\":\"Number\",\"required\":true}},{\"filterType\":\"numeric\",\"key\":\"Total\",\"type\":\"inputNumber\",\"props\":{\"label\":\"Total\",\"required\":true}},{\"filterType\":\"date\",\"key\":\"CreateDate\",\"type\":\"datepicker\",\"props\":{\"label\":\"Create Date\",\"required\":true}}]}", "[{\"key\":\"FirstName\",\"type\":\"input\",\"filterType\":\"text\",\"props\":{\"label\":\"First Name\",\"placeholder\":\"Enter First Name\"},\"searchRule\":{\"field\":\"FirstName\",\"matchMode\":\"contains\"}},{\"key\":\"Number\",\"type\":\"inputNumber\",\"filterType\":\"numeric\",\"props\":{\"label\":\"Number\",\"placeholder\":\"Enter Number\"},\"searchRule\":{\"field\":\"Number\",\"matchMode\":\"gt\"}},{\"key\":\"Name\",\"type\":\"multiSelect\",\"filterType\":\"text\",\"props\":{\"label\":\"Names\",\"placeholder\":\"Please select\",\"options\":[{\"value\":\"James\",\"label\":\"James\"},{\"value\":\"Robert\",\"label\":\"Robert\"},{\"value\":\"John\",\"label\":\"John\"},{\"value\":\"Michael\",\"label\":\"Michael\"}]},\"searchRule\":{\"field\":\"Name\",\"matchMode\":\"in\"}},{\"key\":\"CreateDate\",\"type\":\"datepicker\",\"filterType\":\"date\",\"props\":{\"label\":\"Create Date\",\"placeholder\":\"Please select\"},\"searchRule\":{\"field\":\"CreateDate\",\"matchMode\":\"dateAfter\"}},{\"key\":\"Checked\",\"type\":\"checkbox\",\"filterType\":\"boolean\",\"props\":{\"label\":\"Checked\"},\"searchRule\":{\"field\":\"Checked\",\"matchMode\":\"equals\"}}]" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                schema: "dbo",
                table: "DemoTables",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldDefaultValueSql: "NEWID()");

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "UniversalGridConfigurations",
                keyColumn: "Id",
                keyValue: new Guid("82cfa0d5-1033-4a08-8294-4d4bc2de3d6b"),
                columns: new[] { "ColumnsConfig", "CustomActionConfig", "DetailConfig", "SearchConfig" },
                values: new object[] { "[{\"field\":\"Name\",\"header\":\"Name\",\"width\":\"130px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"FirstName\",\"header\":\"First Name\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Checked\",\"header\":\"Checked\",\"width\":\"250px\",\"filterType\":\"boolean\",\"sortable\":true},{\"field\":\"Number\",\"header\":\"Number\",\"width\":\"250px\",\"filterType\":\"numeric\",\"sortable\":true},{\"field\":\"Total\",\"header\":\"Total\",\"width\":\"250px\",\"filterType\":\"numeric\",\"sortable\":true},{\"field\":\"CreateDate\",\"header\":\"Create Date\",\"width\":\"250px\",\"filterType\":\"date\",\"sortable\":false}]", "[{\"Name\":\"edit-role\"},{\"Name\":\"edit-permission\"},{\"Name\":\"manage-roles\"}]", "{\"AllowExport\":true,\"AllowDelete\":true,\"AllowEdit\":true,\"UseCustomForm\":true,\"CustomAddFormName\":\"user-manager-add\",\"CustomEditFormName\":\"user-manager-edit\",\"CustomViewFormName\":\"user-manager-view\"}", "[{\"key\":\"FirstName\",\"type\":\"input\",\"filterType\":\"text\",\"props\":{\"label\":\"First Name\",\"placeholder\":\"Enter First Name\"},\"searchRule\":{\"field\":\"FirstName\",\"matchMode\":\"contains\"}},{\"key\":\"Number\",\"type\":\"inputNumber\",\"filterType\":\"numeric\",\"props\":{\"label\":\"Number\",\"placeholder\":\"Enter Number\"},\"searchRule\":{\"field\":\"Number\",\"matchMode\":\"gt\"}},{\"key\":\"Name\",\"type\":\"multiSelect\",\"filterType\":\"text\",\"props\":{\"label\":\"Names\",\"placeholder\":\"Please select\",\"options\":[{\"value\":\"James\",\"label\":\"James\"},{\"value\":\"Robert\",\"label\":\"Robert\"},{\"value\":\"John\",\"label\":\"John\"},{\"value\":\"Michael\",\"label\":\"Michael\"}]},\"searchRule\":{\"field\":\"Name\",\"matchMode\":\"in\"}},{\"key\":\"CreateDate\",\"type\":\"datepicker\",\"filterType\":\"date\",\"props\":{\"label\":\"Create Date\",\"placeholder\":\"Please select\"},\"searchRule\":{\"field\":\"CreateDate\",\"matchMode\":\"gt\"}},{\"key\":\"Checked\",\"type\":\"checkbox\",\"filterType\":\"boolean\",\"props\":{\"label\":\"Checked\"},\"searchRule\":{\"field\":\"Checked\",\"matchMode\":\"equals\"}}]" });
        }
    }
}
