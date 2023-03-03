using Microsoft.EntityFrameworkCore.Migrations;
using System;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class initialDataConnection : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                schema: "dep",
                table: "DataSourceConnections",
                columns: new[] { "Id", "ConnectionString", "Name" },
                values: new object[] { new Guid("4deff6db-d3d6-447f-b3de-ce2d8b242e36"), "", "Default" });

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "Lookups",
                keyColumn: "Id",
                keyValue: new Guid("704a3d00-62df-4c62-a4bd-457c4dc242ca"),
                column: "DataSourceConnectionId",
                value: new Guid("4deff6db-d3d6-447f-b3de-ce2d8b242e36"));

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "Lookups",
                keyColumn: "Id",
                keyValue: new Guid("727052ba-0033-42c9-a39c-06a103e4b021"),
                column: "DataSourceConnectionId",
                value: new Guid("4deff6db-d3d6-447f-b3de-ce2d8b242e36"));

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "Lookups",
                keyColumn: "Id",
                keyValue: new Guid("e1f3e2c7-25ca-4d69-9405-abc54923864d"),
                column: "DataSourceConnectionId",
                value: new Guid("4deff6db-d3d6-447f-b3de-ce2d8b242e36"));

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "UniversalGridConfigurations",
                keyColumn: "Id",
                keyValue: new Guid("071f5419-85b8-11ed-a86f-0242ac130004"),
                columns: new[] { "DataSourceConfig", "DataSourceConnectionId" },
                values: new object[] { "{\"DataSourceConnectionId\":\"4DEFF6DB-D3D6-447F-B3DE-CE2D8B242E36\",\"TableName\":\"Users\",\"TableSchema\":\"dep\",\"IdColumn\":\"Id\",\"Columns\":[\"Id\",\"Username\",\"Name\",\"Email\",\"Phone\",\"AutoEmail\",\"Vendor\",\"Employer\",\"Comments\"],\"SortBy\":[{\"field\":\"Name\",\"order\":1}]}", new Guid("4deff6db-d3d6-447f-b3de-ce2d8b242e36") });

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "UniversalGridConfigurations",
                keyColumn: "Id",
                keyValue: new Guid("82cfa0d5-1033-4a08-8294-4d4bc2de3d6b"),
                columns: new[] { "DataSourceConfig", "DataSourceConnectionId" },
                values: new object[] { "{\"DataSourceConnectionId\":\"4DEFF6DB-D3D6-447F-B3DE-CE2D8B242E36\",\"TableName\":\"DemoTables\",\"TableSchema\":\"dbo\",\"IdColumn\":\"Id\",\"Columns\":[],\"SortBy\":[]}", new Guid("4deff6db-d3d6-447f-b3de-ce2d8b242e36") });

            migrationBuilder.AlterColumn<Guid>(
                name: "DataSourceConnectionId",
                schema: "dep",
                table: "Lookups",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Lookups_DataSourceConnectionId",
                schema: "dep",
                table: "Lookups",
                column: "DataSourceConnectionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Lookups_DataSourceConnections_DataSourceConnectionId",
                schema: "dep",
                table: "Lookups",
                column: "DataSourceConnectionId",
                principalSchema: "dep",
                principalTable: "DataSourceConnections",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                schema: "dep",
                table: "DataSourceConnections",
                keyColumn: "Id",
                keyValue: new Guid("4deff6db-d3d6-447f-b3de-ce2d8b242e36"));

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "Lookups",
                keyColumn: "Id",
                keyValue: new Guid("704a3d00-62df-4c62-a4bd-457c4dc242ca"),
                column: "DataSourceConnectionId",
                value: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "Lookups",
                keyColumn: "Id",
                keyValue: new Guid("727052ba-0033-42c9-a39c-06a103e4b021"),
                column: "DataSourceConnectionId",
                value: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "Lookups",
                keyColumn: "Id",
                keyValue: new Guid("e1f3e2c7-25ca-4d69-9405-abc54923864d"),
                column: "DataSourceConnectionId",
                value: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "UniversalGridConfigurations",
                keyColumn: "Id",
                keyValue: new Guid("071f5419-85b8-11ed-a86f-0242ac130004"),
                columns: new[] { "DataSourceConfig", "DataSourceConnectionId" },
                values: new object[] { "{\"TableName\":\"Users\",\"TableSchema\":\"dep\",\"IdColumn\":\"Id\",\"Columns\":[\"Id\",\"Username\",\"Name\",\"Email\",\"Phone\",\"AutoEmail\",\"Vendor\",\"Employer\",\"Comments\"],\"SortBy\":[{\"field\":\"Name\",\"order\":1}]}", null });

            migrationBuilder.UpdateData(
                schema: "dep",
                table: "UniversalGridConfigurations",
                keyColumn: "Id",
                keyValue: new Guid("82cfa0d5-1033-4a08-8294-4d4bc2de3d6b"),
                columns: new[] { "DataSourceConfig", "DataSourceConnectionId" },
                values: new object[] { "{\"TableName\":\"DemoTables\",\"TableSchema\":\"dbo\",\"IdColumn\":\"Id\",\"Columns\":[],\"SortBy\":[]}", null });
        }
    }
}
