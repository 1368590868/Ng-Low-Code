using DataEditorPortal.Data.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text.Json;

namespace DataEditorPortal.Data.Contexts
{
    public class DepDbContext : DbContext
    {
        public DepDbContext(DbContextOptions<DepDbContext> options) : base(options)
        {
        }

        public virtual DbSet<SiteSetting> SiteSettings { get; set; }

        public virtual DbSet<User> Users { get; set; }
        public virtual DbSet<UserPermission> UserPermissions { get; set; }
        public virtual DbSet<SiteRole> SiteRoles { get; set; }
        public virtual DbSet<SitePermission> SitePermissions { get; set; }
        public virtual DbSet<SiteRolePermission> SiteRolePermissions { get; set; }

        public virtual DbSet<SiteMenu> SiteMenus { get; set; }
        public virtual DbSet<Lookup> Lookups { get; set; }

        public virtual DbSet<UniversalGridConfiguration> UniversalGridConfigurations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            #region Initial data

            #region Default menus and pages

            modelBuilder.Entity<SiteMenu>().HasData(
               // Admin Settings 
               new SiteMenu()
               {
                   Id = new Guid("B82DFE59-E51A-4771-B876-05D62F4207E3"),
                   Name = "settings",
                   Label = "Settings",
                   Icon = "pi pi-cog",
                   Type = "System",
                   Link = "",
                   Order = 999,
                   Status = Common.PortalItemStatus.Published
               },
               // Portal Management
               new SiteMenu()
               {
                   Id = new Guid("B4B490EA-9DF3-4F7A-8806-936CA7F87B8F"),
                   Name = "portal-management",
                   Label = "Portal Management",
                   Icon = "pi pi-desktop",
                   Type = "System",
                   Link = "/portal-management/list",
                   ParentId = new Guid("B82DFE59-E51A-4771-B876-05D62F4207E3"),
                   Order = 0,
                   Status = Common.PortalItemStatus.Published
               },
               // User Management
               new SiteMenu()
               {
                   Id = new Guid("4E22E18E-492E-4786-8170-FB8F0C9D3A62"),
                   Name = "user-management",
                   Label = "User Management",
                   Icon = "pi pi-user",
                   Type = "System",
                   Link = "/portal-item/user-management",
                   ParentId = new Guid("B82DFE59-E51A-4771-B876-05D62F4207E3"),
                   Order = 1,
                   Status = Common.PortalItemStatus.Published
               },
                // site settings
                new SiteMenu()
                {
                    Id = new Guid("CBF29EC9-B605-45F1-A84F-5A7FC99AD6B3"),
                    Name = "site-settings",
                    Label = "Site Settings",
                    Icon = "pi pi-wrench",
                    Type = "System",
                    Link = "/site-settings",
                    ParentId = new Guid("B82DFE59-E51A-4771-B876-05D62F4207E3"),
                    Order = 2,
                    Status = Common.PortalItemStatus.Published
                }
            );

            #endregion

            #region Default admin user and roles | permissions

            modelBuilder.Entity<SiteRole>().HasData(
                new SiteRole()
                {
                    Id = new Guid("33D70A90-0C4C-48EE-AD8F-3051448D19CF"),
                    RoleName = "Users"
                }
            );

            #endregion

            #region user management configuration

            modelBuilder.Entity<UniversalGridConfiguration>().HasData(
                new UniversalGridConfiguration()
                {
                    Id = Guid.Parse("071f5419-85b8-11ed-a86f-0242ac130004"),
                    Name = "user-management",
                    ConfigCompleted = true,

                    DataSourceConfig = JsonSerializer.Serialize(new
                    {
                        TableName = "Users",
                        TableSchema = "dep",
                        IdColumn = "Id",
                        Columns = new List<string>() { "Id", "Username", "Name", "Email", "Phone", "AutoEmail", "Vendor", "Employer", "Division", "Comments" },
                        SortBy = new List<object>() { new { field = "Name", order = 1 } }
                    }),

                    ColumnsConfig = JsonSerializer.Serialize(new object[] {
                        new { field = "Username", header = "CNP ID", width = "130px", filterType = "text", sortable = true },
                        new { field = "Name", header = "Name", width = "250px", filterType = "text", sortable = true },
                        new { field = "Email", header = "Email", width = "250px", filterType = "text", sortable = true },
                        new { field = "Phone", header = "Phone", width = "250px", filterType = "text", sortable = true },
                        new { field = "AutoEmail", header = "Auto Email", width = "250px", filterType = "text", sortable = true },
                        new { field = "Vendor", header = "Vendor", width = "250px", filterType = "text", sortable = true },
                        new { field = "Employer", header = "Employer", width = "250px", filterType = "text", sortable = true },
                        new { field = "Division", header = "Division", width = "250px", filterType = "text", sortable = false },
                        new { field = "Comments", header = "Comments", width = "250px", filterType = "text", sortable = true }
                    }),

                    SearchConfig = JsonSerializer.Serialize(new object[] {
                        new {
                            key = "username",
                            type = "input",
                            filterType = "text",
                            props = new {
                                label = "CNP ID",
                                placeholder = "CNP ID"
                            },
                            searchRule = new
                            {
                                field = "Username",
                                matchMode = "contains"
                            }
                        },
                        new {
                            key = "name",
                            type = "input",
                            filterType = "text",
                            props = new {
                                label = "Name",
                                placeholder = "Name"
                            },
                            searchRule = new
                            {
                                field = "Name",
                                matchMode = "contains"
                            }
                        },
                        new {
                            key = "roles",
                            type = "select",
                            filterType = "text",
                            props = new {
                                label = "Roles",
                                placeholder = "Please select",
                                options = new object[] {
                                    new { value = 1, label = "Option 1" },
                                    new { value = 2, label = "Option 2" },
                                    new { value = 3, label = "Option 3" },
                                    new { value = 4, label = "Option 4" }
                                }
                            },
                            searchRule = new
                            {
                                whereClause = "Id in (select UserId from USERID_PERMISSION where PERMISSION_GRANT_ID = '{0}')"
                            }
                        },
                        new {
                            key = "vendor",
                            type = "select",
                            filterType = "text",
                            props = new {
                                label = "Vendor",
                                placeholder = "Please select",
                                options = new object[] {
                                    new { value = 1, label = "Option 1" },
                                    new { value = 2, label = "Option 2" },
                                    new { value = 3, label = "Option 3" },
                                    new { value = 4, label = "Option 4" }
                                }
                            },
                            searchRule = new
                            {
                                field = "Vendor",
                                matchMode = "contains"
                            }
                        },
                        new {
                            key = "employer",
                            type = "select",
                            filterType = "text",
                            props = new {
                                label = "Employer",
                                placeholder = "Please select",
                                options = new object[] {
                                    new { value = 1, label = "Option 1" },
                                    new { value = 2, label = "Option 2" },
                                    new { value = 3, label = "Option 3" },
                                    new { value = 4, label = "Option 4" }
                                }
                            },
                            searchRule = new
                            {
                                field = "Employer",
                                matchMode = "contains"
                            }
                        }
                    }),

                    DetailConfig = JsonSerializer.Serialize(new
                    {
                        AllowExport = true,
                        AllowDelete = true,
                        AllowEdit = true,
                        UseCustomForm = true,
                        CustomAddFormName = "user-manager-add",
                        CustomEditFormName = "user-manager-edit",
                        CustomViewFormName = "user-manager-view"
                    }),

                    CustomActionConfig = JsonSerializer.Serialize(new object[] {
                        new { Name = "edit-role" },
                        new { Name = "edit-permission" },
                        new { Name = "manage-roles" },
                    })
                }
            );

            modelBuilder.Entity<SitePermission>().HasData(
                new SitePermission()
                {
                    Id = new Guid("23a76524-d095-493e-8603-173c21e9c3cb"),
                    Category = $"Portal Item: User Management",
                    PermissionName = $"VIEW_USER_MANAGEMENT".ToUpper(),
                    PermissionDescription = $"View User Management"
                },
                new SitePermission()
                {
                    Id = new Guid("1eca5d20-6c93-4296-8328-d27ded7a30fc"),
                    Category = $"Portal Item: User Management",
                    PermissionName = $"ADD_USER_MANAGEMENT".ToUpper(),
                    PermissionDescription = $"Add User Management"
                },
                new SitePermission()
                {
                    Id = new Guid("2f80b74d-7e82-4df0-ad77-3fda22b8f454"),
                    Category = $"Portal Item: User Management",
                    PermissionName = $"EDIT_USER_MANAGEMENT".ToUpper(),
                    PermissionDescription = $"Edit User Management"
                },
                new SitePermission()
                {
                    Id = new Guid("a05a95e3-e010-4377-840d-d55025069ed0"),
                    Category = $"Portal Item: User Management",
                    PermissionName = $"DELETE_USER_MANAGEMENT".ToUpper(),
                    PermissionDescription = $"Delete User Management"
                },
                new SitePermission()
                {
                    Id = new Guid("ccf158bb-7da8-42f7-a18f-7291c871d996"),
                    Category = $"Portal Item: User Management",
                    PermissionName = $"EXPORT_USER_MANAGEMENT".ToUpper(),
                    PermissionDescription = $"Export User Management"
                }
            );

            #endregion

            #endregion
        }
    }
}
