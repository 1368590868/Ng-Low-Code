using DataEditorPortal.Data.Common;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Models.UniversalGrid;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace DataEditorPortal.Web.Common.Install
{
    public interface ISeedDataCreator
    {
        public bool IsInstalled();
        public void Create();
    }

    public class SeedDataCreator : ISeedDataCreator
    {
        private readonly DepDbContext _depDbContext;
        private IConfiguration _configuration { get; }

        public SeedDataCreator(DepDbContext depDbContext, IConfiguration configuration)
        {
            _depDbContext = depDbContext;
            _configuration = configuration;
        }

        public bool IsInstalled()
        {
            var setting = _depDbContext.SiteSettings.FirstOrDefault();
            return setting != null;
        }

        public void Create()
        {
            #region Default menus and pages

            var menus = new List<SiteMenu>(){
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
                    Status = PortalItemStatus.Published
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
                    Status = PortalItemStatus.Published
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
                    Status = PortalItemStatus.Published
                },
                // data dictionary
                new SiteMenu()
                {
                    Id = new Guid("32B6E555-846F-4050-A22D-D40D39E0B71F"),
                    Name = "data-dictionaries",
                    Label = "Data Dictionaries",
                    Icon = "pi pi-book",
                    Type = "System",
                    Link = "/data-dictionaries",
                    ParentId = new Guid("B82DFE59-E51A-4771-B876-05D62F4207E3"),
                    Order = 2,
                    Status = PortalItemStatus.Published
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
                    Order = 3,
                    Status = PortalItemStatus.Published
                },
                // system event log
                new SiteMenu()
                {
                    Id = new Guid("B0864169-8CA1-49E4-AE1E-BFC53756231B"),
                    Name = "system-event-logs",
                    Label = "System Event Logs",
                    Icon = "pi pi-clock",
                    Type = "System",
                    Link = "/system-event-logs",
                    ParentId = new Guid("B82DFE59-E51A-4771-B876-05D62F4207E3"),
                    Order = 4,
                    Status = PortalItemStatus.Published
                },
                // demo items
                new SiteMenu()
                {
                    Id = new Guid("41D85A79-9E84-4AB8-AF96-08DAF9CD4412"),
                    Name = "demo",
                    Label = "Demo Items",
                    Icon = "pi pi-list",
                    Type = "Folder",
                    Link = "",
                    Order = 998,
                    Status = PortalItemStatus.Published
                },
                new SiteMenu()
                {
                    Id = new Guid("92A804C3-CA4B-4987-5659-08DB05B2DE84"),
                    Name = "demo-item",
                    Label = "Demo Item",
                    Icon = "pi pi-table",
                    Type = "Portal Item",
                    Link = "",
                    ParentId = new Guid("41D85A79-9E84-4AB8-AF96-08DAF9CD4412"),
                    Order = 0,
                    Status = PortalItemStatus.Published
                }};

            foreach (var item in menus)
            {
                var entity = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == item.Id);
                if (entity != null) _depDbContext.SiteMenus.Update(item);
                else _depDbContext.SiteMenus.Add(item);
            }

            #endregion

            #region Default admin user and roles | permissions

            var roles = new List<SiteRole>() {
                new SiteRole()
                {
                    Id = new Guid("790D7DB8-FEB2-40F8-8F74-5F228C0ADA03"),
                    RoleName = "Administrators"
                },
                new SiteRole()
                {
                    Id = new Guid("33D70A90-0C4C-48EE-AD8F-3051448D19CF"),
                    RoleName = "Users"
                }
            };

            foreach (var item in roles)
            {
                _depDbContext.SiteRoles.Add(item);
            }

            #endregion

            #region Default Database Connection

            foreach (var con in _configuration.GetSection("ConnectionStrings").GetChildren())
            {
                var connection = new DataSourceConnection()
                {
                    Name = con.Key,
                    ConnectionString = con.Value
                };
                if (con.Key == "Default") connection.Id = new Guid("4DEFF6DB-D3D6-447F-B3DE-CE2D8B242E36");
                _depDbContext.DataSourceConnections.Add(connection);
            }


            #endregion
            #region Data Dictionaries

            var dic = new List<DataDictionary>(){
                new DataDictionary()
                {
                    Id = new Guid("C8182B75-4E71-4A35-9CF7-19758B8EA15A"),
                    Label = "Gas",
                    Value = "Gas",
                    Value1 = "CENTERPOINT",
                    Value2 = "",
                    Category = "Division"
                },
                new DataDictionary()
                {
                    Id = new Guid("CC73CCF0-870B-4011-9BA4-89408D12FD2B"),
                    Label = "Electric",
                    Value = "Electric",
                    Value1 = "CENTERPOINT",
                    Value2 = "",
                    Category = "Division"
                },
                new DataDictionary()
                {
                    Id = new Guid("856F3A29-CBA4-48D5-A31F-D8EA7AF838DE"),
                    Label = "Underground",
                    Value = "Underground",
                    Value1 = "RAMTECH",
                    Value2 = "",
                    Category = "Division"
                },
                new DataDictionary()
                {
                    Id = new Guid("7A6528B3-284A-4FD5-83DC-E7E0C91F059F"),
                    Label = "Landbase",
                    Value = "Landbase",
                    Value1 = "RAMTECH",
                    Value2 = "",
                    Category = "Division"
                },
                new DataDictionary()
                {
                    Id = new Guid("E3F22C35-4FE7-428F-B9C4-9B3CFC49902C"),
                    Label = "BEN HOLLOWAY CNP",
                    Value = "BEN HOLLOWAY CNP",
                    Value1 = "RAMTECH",
                    Value2 = "",
                    Category = "Employer"
                },
                new DataDictionary()
                {
                    Id = new Guid("2A7221EB-CFC0-4AA5-87DA-9BA1B79ECDC8"),
                    Label = "ALEX SHINALL CNP",
                    Value = "ALEX SHINALL CNP",
                    Value1 = "CENTERPOINT",
                    Value2 = "",
                    Category = "Employer"
                },
                new DataDictionary()
                {
                    Id = new Guid("C782E51E-4235-4F27-AC6F-40A8C5207DFE"),
                    Label = "CENTERPOINT",
                    Value = "CENTERPOINT",
                    Value1 = "",
                    Value2 = "",
                    Category = "Vendor"
                },
                new DataDictionary()
                {
                    Id = new Guid("F882F0E5-AEF2-42A8-92B6-626D9450B576"),
                    Label = "RAMTECH",
                    Value = "RAMTECH",
                    Value1 = "",
                    Value2 = "",
                    Category = "Vendor"
                }
            };

            foreach (var item in dic)
            {
                _depDbContext.DataDictionaries.Add(item);
            }

            #endregion

            #region User management configuration

            // lookups
            var lookups = new List<Lookup>() {
                new Lookup()
                {
                    Id = Guid.Parse("727052BA-0033-42C9-A39C-06A103E4B021"),
                    Name = "Roles",
                    QueryText = $"SELECT sr.RoleName AS Label, sr.Id AS Value FROM {Constants.DEFAULT_SCHEMA}.SiteRoles sr ORDER BY sr.RoleName",
                    DataSourceConnectionId = new Guid("4DEFF6DB-D3D6-447F-B3DE-CE2D8B242E36")
                },
                new Lookup()
                {
                    Id = Guid.Parse("E1F3E2C7-25CA-4D69-9405-ABC54923864D"),
                    Name = "Vendors",
                    QueryText = $"SELECT dd.Label, dd.Value FROM {Constants.DEFAULT_SCHEMA}.DataDictionaries dd WHERE dd.Category = 'Vendor' ORDER BY dd.Label",
                    DataSourceConnectionId = new Guid("4DEFF6DB-D3D6-447F-B3DE-CE2D8B242E36")
                },
                new Lookup()
                {
                    Id = Guid.Parse("704A3D00-62DF-4C62-A4BD-457C4DC242CA"),
                    Name = "Employers",
                    QueryText = $"SELECT dd.Label, dd.Value, dd.Value1, dd.Value2 FROM {Constants.DEFAULT_SCHEMA}.DataDictionaries dd WHERE dd.Category = 'Employer' {{{{ AND dd.Value1 IN ##vendor## }}}} ORDER BY dd.Label",
                    DataSourceConnectionId = new Guid("4DEFF6DB-D3D6-447F-B3DE-CE2D8B242E36")
                }
            };
            foreach (var item in lookups)
            {
                _depDbContext.Lookups.Add(item);
            }

            var userManagement = new UniversalGridConfiguration()
            {
                Id = Guid.Parse("071f5419-85b8-11ed-a86f-0242ac130004"),
                Name = "user-management",
                ConfigCompleted = true,
                DataSourceConnectionId = new Guid("4DEFF6DB-D3D6-447F-B3DE-CE2D8B242E36"),

                DataSourceConfig = JsonSerializer.Serialize(new DataSourceConfig
                {
                    DataSourceConnectionId = Guid.Parse("4DEFF6DB-D3D6-447F-B3DE-CE2D8B242E36"),
                    TableName = "Users",
                    TableSchema = Constants.DEFAULT_SCHEMA,
                    IdColumn = "Id",
                    Columns = new List<string>() { "Id", "Username", "Name", "Email", "Phone", "AutoEmail", "Vendor", "Employer", "Comments" },
                    SortBy = new List<SortParam>() { new SortParam { field = "Name", order = 1 } }
                }),

                ColumnsConfig = JsonSerializer.Serialize(new GridColConfig[] {
                        new GridColConfig { type = "DataBaseField", field = "Username", header = "CNP ID", width = "130px", filterType = "text", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "Name", header = "Name", width = "250px", filterType = "text", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "Email", header = "Email", width = "250px", filterType = "text", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "Phone", header = "Phone", width = "250px", filterType = "text", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "AutoEmail", header = "Auto Email", width = "250px", filterType = "boolean", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "Vendor", header = "Vendor", width = "250px", filterType = "text", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "Employer", header = "Employer", width = "250px", filterType = "text", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "Comments", header = "Comments", width = "250px", filterType = "text", sortable = true }
                    }),

                SearchConfig = JsonSerializer.Serialize(new SearchFieldConfig[] {
                        new SearchFieldConfig {
                            key = "username",
                            type = "input",
                            filterType = "text",
                            props = new {
                                label = "CNP ID",
                                placeholder = "CNP ID"
                            },
                            searchRule = new SearchFieldFilterRule
                            {
                                field = "Username",
                                matchMode = "contains"
                            }
                        },
                        new SearchFieldConfig {
                            key = "name",
                            type = "input",
                            filterType = "text",
                            props = new {
                                label = "Name",
                                placeholder = "Name"
                            },
                            searchRule = new SearchFieldFilterRule
                            {
                                field = "Name",
                                matchMode = "contains"
                            }
                        },
                        new SearchFieldConfig {
                            key = "roles",
                            type = "multiSelect",
                            filterType = "text",
                            props = new {
                                label = "Roles",
                                placeholder = "Please select",
                                optionsLookup = "727052BA-0033-42C9-A39C-06A103E4B021"
                            },
                            searchRule = new SearchFieldFilterRule
                            {
                                whereClause = $"Id in (select UserId from {Constants.DEFAULT_SCHEMA}.UserPermissions where PermissionGrantId in (##VALUE##))"
                            }
                        },
                        new SearchFieldConfig {
                            key = "vendor",
                            type = "multiSelect",
                            filterType = "text",
                            props = new {
                                label = "Vendor",
                                placeholder = "Please select",
                                optionsLookup = "E1F3E2C7-25CA-4D69-9405-ABC54923864D"
                            },
                            searchRule = new SearchFieldFilterRule
                            {
                                field = "Vendor",
                                matchMode = "in"
                            }
                        },
                        new SearchFieldConfig {
                            key = "employer",
                            type = "multiSelect",
                            filterType = "text",
                            props = new {
                                label = "Employer",
                                placeholder = "Please select",
                                optionsLookup = "704A3D00-62DF-4C62-A4BD-457C4DC242CA",
                                dependOnFields = new object[]{ "vendor" }
                            },
                            searchRule = new SearchFieldFilterRule
                            {
                                field = "Employer",
                                matchMode = "in"
                            }
                        }
                    }),

                DetailConfig = JsonSerializer.Serialize(new DetailConfig
                {
                    AddingForm = new GridFormLayout
                    {
                        UseCustomForm = true,
                        CustomFormName = "user-manager-add"
                    },
                    UpdatingForm = new GridFormLayout
                    {
                        UseCustomForm = true,
                        CustomFormName = "user-manager-edit"
                    }
                }),

                CustomActionConfig = JsonSerializer.Serialize(new CustomAction[] {
                        new CustomAction { Name = "edit-role" },
                        new CustomAction { Name = "edit-permission" },
                        new CustomAction { Name = "manage-roles" },
                    })
            };
            _depDbContext.UniversalGridConfigurations.Add(userManagement);

            var permissions = new List<SitePermission>() {
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
            };
            foreach (var item in permissions)
            {
                _depDbContext.SitePermissions.Add(item);
            }

            #endregion

            #region Demo table

            var demoTable = new UniversalGridConfiguration()
            {
                Id = Guid.Parse("82CFA0D5-1033-4A08-8294-4D4BC2DE3D6B"),
                Name = "demo-item",
                ConfigCompleted = true,
                DataSourceConnectionId = new Guid("4DEFF6DB-D3D6-447F-B3DE-CE2D8B242E36"),

                DataSourceConfig = JsonSerializer.Serialize(new DataSourceConfig
                {
                    DataSourceConnectionId = Guid.Parse("4DEFF6DB-D3D6-447F-B3DE-CE2D8B242E36"),
                    TableName = "DemoTables",
                    TableSchema = Constants.DEFAULT_SCHEMA,
                    IdColumn = "Id",
                    Columns = new List<string>() { },
                    SortBy = new List<SortParam>() { }
                }),

                ColumnsConfig = JsonSerializer.Serialize(new GridColConfig[] {
                        new GridColConfig { type = "DataBaseField", field = "Name", header = "Name", width = "130px", filterType = "text", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "FirstName", header = "First Name", width = "250px", filterType = "text", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "Checked", header = "Checked", width = "250px", filterType = "boolean", sortable = false },
                        new GridColConfig { type = "DataBaseField", field = "Number", header = "Number", width = "250px", filterType = "numeric", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "Total", header = "Total", width = "250px", filterType = "numeric", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "CreateDate", header = "Create Date", width = "250px", filterType = "date", sortable = true }
                    }),

                SearchConfig = JsonSerializer.Serialize(new SearchFieldConfig[] {
                        new SearchFieldConfig {
                            key = "FirstName",
                            type = "input",
                            filterType = "text",
                            props = new {
                                label = "First Name",
                                placeholder = "Enter First Name"
                            },
                            searchRule = new SearchFieldFilterRule
                            {
                                field = "FirstName",
                                matchMode = "contains"
                            }
                        },
                        new SearchFieldConfig {
                            key = "Number",
                            type = "inputNumber",
                            filterType = "numeric",
                            props = new {
                                label = "Number",
                                placeholder = "Enter Number"
                            },
                            searchRule = new SearchFieldFilterRule
                            {
                                field = "Number",
                                matchMode = "gt"
                            }
                        },
                        new SearchFieldConfig {
                            key = "Name",
                            type = "multiSelect",
                            filterType = "text",
                            props = new {
                                label = "Names",
                                placeholder = "Please select",
                                options = new object[] {
                                    new { value = "James", label = "James" },
                                    new { value = "Robert", label = "Robert" },
                                    new { value = "John", label = "John" },
                                    new { value = "Michael", label = "Michael" }
                                }
                            },
                            searchRule = new SearchFieldFilterRule
                            {
                                field = "Name",
                                matchMode = "in"
                            }
                        },
                        new SearchFieldConfig {
                            key = "CreateDate",
                            type = "datepicker",
                            filterType = "date",
                            props = new {
                                label = "Create Date",
                                placeholder = "Please select"
                            },
                            searchRule = new SearchFieldFilterRule
                            {
                                field = "CreateDate",
                                matchMode = "dateAfter"
                            }
                        },
                        new SearchFieldConfig {
                            key = "Checked",
                            type = "checkbox",
                            filterType = "boolean",
                            props = new {
                                label = "Checked"
                            },
                            searchRule = new SearchFieldFilterRule
                            {
                                field = "Checked",
                                matchMode = "equals"
                            }
                        }
                    }),

                DetailConfig = JsonSerializer.Serialize(new DetailConfig
                {
                    AddingForm = new GridFormLayout
                    {
                        UseCustomForm = false,
                        FormFields = new List<FormFieldConfig> {
                                new FormFieldConfig
                                {
                                    filterType = "text",
                                    key = "Name",
                                    type = "input",
                                    props = new
                                    {
                                        label = "Name",
                                        required = true
                                    }
                                },
                                new FormFieldConfig
                                {
                                    filterType = "text",
                                    key = "FirstName",
                                    type = "input",
                                    props = new
                                    {
                                        label = "First Name",
                                        required = true
                                    }
                                },
                                new FormFieldConfig
                                {
                                    filterType = "boolean",
                                    key = "Checked",
                                    type = "checkbox",
                                    props = new
                                    {
                                        label = "Checked",
                                        required = true
                                    }
                                },
                                new FormFieldConfig
                                {
                                    filterType = "numeric",
                                    key = "Number",
                                    type = "inputNumber",
                                    props = new
                                    {
                                        label = "Number",
                                        maxFractionDigits = 0,
                                        required = true
                                    }
                                },
                                new FormFieldConfig
                                {
                                    filterType = "numeric",
                                    key = "Total",
                                    type = "inputNumber",
                                    props = new
                                    {
                                        label = "Total",
                                        required = true
                                    }
                                },
                                new FormFieldConfig
                                {
                                    filterType = "date",
                                    key = "CreateDate",
                                    type = "datepicker",
                                    props = new
                                    {
                                        label = "Create Date",
                                        required = true
                                    }
                                }
                            }
                    },
                    UpdatingForm = new GridFormLayout
                    {
                        UseAddingFormLayout = true
                    }
                }),

                CustomActionConfig = JsonSerializer.Serialize(new CustomAction[] { })
            };
            _depDbContext.UniversalGridConfigurations.Add(demoTable);

            permissions = new List<SitePermission>() {
                new SitePermission()
                {
                    Id = new Guid("06A315CD-CF13-42CF-8BAE-1F6680651B58"),
                    Category = $"Portal Item: Demo Item",
                    PermissionName = $"VIEW_DEMO_ITEM".ToUpper(),
                    PermissionDescription = $"View Demo Item"
                },
                new SitePermission()
                {
                    Id = new Guid("804B67E6-AB28-4376-8CE4-98E40515F3B6"),
                    Category = $"Portal Item: Demo Item",
                    PermissionName = $"ADD_DEMO_ITEM".ToUpper(),
                    PermissionDescription = $"Add Demo Item"
                },
                new SitePermission()
                {
                    Id = new Guid("33881049-8096-47BE-866F-CC686A9BF587"),
                    Category = $"Portal Item: Demo Item",
                    PermissionName = $"EDIT_DEMO_ITEM".ToUpper(),
                    PermissionDescription = $"Edit Demo Item"
                },
                new SitePermission()
                {
                    Id = new Guid("3145D3C8-8D13-495D-8DD3-525B3D4EBA33"),
                    Category = $"Portal Item: Demo Item",
                    PermissionName = $"DELETE_DEMO_ITEM".ToUpper(),
                    PermissionDescription = $"Delete Demo Item"
                },
                new SitePermission()
                {
                    Id = new Guid("155A1215-214B-4A89-ACAF-72C48AEBB1E9"),
                    Category = $"Portal Item: Demo Item",
                    PermissionName = $"EXPORT_DEMO_ITEM".ToUpper(),
                    PermissionDescription = $"Export Demo Item"
                }
            };
            foreach (var item in permissions)
            {
                _depDbContext.SitePermissions.Add(item);
            }

            var names = new string[] { "John", "Robert", "James", "Tony" };
            var lorem = new string[] { "Lorem", "Ipsum", "Dolor", "Amet" };

            for (var i = 0; i < 1000; i++)
            {
                _depDbContext.DemoTables.Add(new DemoTable()
                {
                    Checked = new Random().Next(0, 1) == 0,
                    CreateDate = DateTime.Now.AddDays(new Random().Next(-365 * 3, 365 * 3)),
                    Division = lorem[new Random().Next(0, 3)],
                    Employor = lorem[new Random().Next(0, 3)],
                    Vendor = lorem[new Random().Next(0, 3)],
                    FirstName = names[new Random().Next(0, 3)],
                    Name = names[new Random().Next(0, 3)],
                    Number = new Random().Next(0, 100),
                    Total = (decimal)new Random().NextDouble() * 100,
                });
            }

            #endregion

            var setting = new SiteSetting() { Installed = true, SiteName = "Data Editor Portal" };
            _depDbContext.Add(setting);

            _depDbContext.SaveChanges();
        }
    }
}
