using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class dataDictionary : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "dep",
                table: "SiteMenus",
                keyColumn: "Id",
                keyValue: new Guid("cbf29ec9-b605-45f1-a84f-5a7fc99ad6b3"),
                column: "Order",
                value: 3);

            migrationBuilder.InsertData(
                schema: "dep",
                table: "SiteMenus",
                columns: new[] { "Id", "Description", "Icon", "Label", "Link", "Name", "Order", "ParentId", "Status", "Type" },
                values: new object[] { new Guid("32b6e555-846f-4050-a22d-d40d39e0b71f"), null, "pi pi-book", "Data Dictionary", "/data-dictionary", "data-dictionary", 2, new Guid("b82dfe59-e51a-4771-b876-05d62f4207e3"), 1, "System" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                schema: "dep",
                table: "SiteMenus",
                keyColumn: "Id",
                keyValue: new Guid("32b6e555-846f-4050-a22d-d40d39e0b71f"));

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "SiteMenus",
                keyColumn: "Id",
                keyValue: new Guid("cbf29ec9-b605-45f1-a84f-5a7fc99ad6b3"),
                column: "Order",
                value: 2);
        }
    }
}
