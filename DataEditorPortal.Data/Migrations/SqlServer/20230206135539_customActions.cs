using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    public partial class customActions : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CustomActionConfig",
                schema: "dep",
                table: "UniversalGridConfigurations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.InsertData(
                schema: "dep",
                table: "SitePermissions",
                columns: new[] { "Id", "Category", "PermissionDescription", "PermissionName" },
                values: new object[,]
                {
                    { new Guid("23a76524-d095-493e-8603-173c21e9c3cb"), "Portal Item: User Management", "View User Management", "VIEW_USER_MANAGEMENT" },
                    { new Guid("1eca5d20-6c93-4296-8328-d27ded7a30fc"), "Portal Item: User Management", "Add User Management", "ADD_USER_MANAGEMENT" },
                    { new Guid("2f80b74d-7e82-4df0-ad77-3fda22b8f454"), "Portal Item: User Management", "Edit User Management", "EDIT_USER_MANAGEMENT" },
                    { new Guid("a05a95e3-e010-4377-840d-d55025069ed0"), "Portal Item: User Management", "Delete User Management", "DELETE_USER_MANAGEMENT" },
                    { new Guid("ccf158bb-7da8-42f7-a18f-7291c871d996"), "Portal Item: User Management", "Export User Management", "EXPORT_USER_MANAGEMENT" }
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                schema: "dep",
                table: "SitePermissions",
                keyColumn: "Id",
                keyValue: new Guid("1eca5d20-6c93-4296-8328-d27ded7a30fc"));

            migrationBuilder.DeleteData(
                schema: "dep",
                table: "SitePermissions",
                keyColumn: "Id",
                keyValue: new Guid("23a76524-d095-493e-8603-173c21e9c3cb"));

            migrationBuilder.DeleteData(
                schema: "dep",
                table: "SitePermissions",
                keyColumn: "Id",
                keyValue: new Guid("2f80b74d-7e82-4df0-ad77-3fda22b8f454"));

            migrationBuilder.DeleteData(
                schema: "dep",
                table: "SitePermissions",
                keyColumn: "Id",
                keyValue: new Guid("a05a95e3-e010-4377-840d-d55025069ed0"));

            migrationBuilder.DeleteData(
                schema: "dep",
                table: "SitePermissions",
                keyColumn: "Id",
                keyValue: new Guid("ccf158bb-7da8-42f7-a18f-7291c871d996"));

            migrationBuilder.DropColumn(
                name: "CustomActionConfig",
                schema: "dep",
                table: "UniversalGridConfigurations");
        }
    }
}
