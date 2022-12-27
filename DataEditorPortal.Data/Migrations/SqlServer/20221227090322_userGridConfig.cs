using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class userGridConfig : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                schema: "dep",
                table: "UniversalGridConfigurations",
                columns: new[] { "Id", "ColumnsConfig", "CreatedBy", "CreatedDate", "DataSourceConfig", "Description", "DetailDialogConfig", "Icon", "Name", "SearchConfig", "UseCustomDetailDialog" },
                values: new object[] { new Guid("071f5419-85b8-11ed-a86f-0242ac130004"), "[{\"field\":\"Username\",\"header\":\"CNP ID\",\"width\":\"130px\",\"filterType\":\"text\"},{\"field\":\"Name\",\"header\":\"Name\",\"width\":\"250px\",\"filterType\":\"text\"},{\"field\":\"Email\",\"header\":\"Email\",\"width\":\"250px\",\"filterType\":\"text\"},{\"field\":\"Phone\",\"header\":\"Phone\",\"width\":\"250px\",\"filterType\":\"text\"},{\"field\":\"AutoEmail\",\"header\":\"Auto Email\",\"width\":\"250px\",\"filterType\":\"text\"},{\"field\":\"Vendor\",\"header\":\"Vendor\",\"width\":\"250px\",\"filterType\":\"text\"},{\"field\":\"Employer\",\"header\":\"Employer\",\"width\":\"250px\",\"filterType\":\"text\"},{\"field\":\"Division\",\"header\":\"Division\",\"width\":\"250px\",\"filterType\":\"text\"},{\"field\":\"Comments\",\"header\":\"Comments\",\"width\":\"250px\",\"filterType\":\"text\"}]", new Guid("00000000-0000-0000-0000-000000000000"), new DateTime(2022, 12, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), "{\"TableName\":\"Users\",\"IdColumn\":\"Id\",\"Columns\":[\"Id\",\"Username\",\"Name\",\"Email\",\"Phone\",\"AutoEmail\",\"Vendor\",\"Employer\",\"Division\",\"Comments\"],\"SortBy\":[{\"field\":\"Name\",\"order\":1}]}", "User Management", null, "", "UserManagement", "[]", false });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                schema: "dep",
                table: "UniversalGridConfigurations",
                keyColumn: "Id",
                keyValue: new Guid("071f5419-85b8-11ed-a86f-0242ac130004"));
        }
    }
}
