using DataEditorPortal.Data.Common;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Models.UniversalGrid;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
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
        private IConfiguration _configuration;
        private readonly ILogger<SeedDataCreator> _logger;

        public SeedDataCreator(
            DepDbContext depDbContext,
            IConfiguration configuration,
            ILogger<SeedDataCreator> logger)
        {
            _depDbContext = depDbContext;
            _configuration = configuration;
            _logger = logger;
        }

        public bool IsInstalled()
        {
            var setting = _depDbContext.SiteSettings.FirstOrDefault();
            return setting != null;
        }

        public bool IsOracle()
        {
            return _configuration.GetValue<string>("DatabaseProvider") == "Oracle";
        }
        public bool IsSqlConnection()
        {
            return _configuration.GetValue<string>("DatabaseProvider") == "SqlConnection";
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
                    Link = "/portal-item/single/user-management",
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
                // datasource connection
                new SiteMenu()
                {
                    Id = new Guid("17016009-bb65-45f2-8b42-095d8b8a4724"),
                    Name = "datasource-connections",
                    Label = "Datasource Connections",
                    Icon = "pi pi-database",
                    Type = "System",
                    Link = "/datasource-connections",
                    ParentId = new Guid("B82DFE59-E51A-4771-B876-05D62F4207E3"),
                    Order = 5,
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
                    QueryText = $"SELECT sr.ROLE_NAME AS LABEL, sr.ID AS VALUE FROM {Constants.DEFAULT_SCHEMA}.SITE_ROLES sr ORDER BY sr.ROLE_NAME",
                    DataSourceConnectionName = Constants.DEFAULT_CONNECTION_NAME
                },
                new Lookup()
                {
                    Id = Guid.Parse("E1F3E2C7-25CA-4D69-9405-ABC54923864D"),
                    Name = "Vendors",
                    QueryText = $"SELECT dd.LABEL, dd.VALUE FROM {Constants.DEFAULT_SCHEMA}.DATA_DICTIONARIES dd WHERE dd.CATEGORY = 'Vendor' ORDER BY dd.LABEL",
                    DataSourceConnectionName = Constants.DEFAULT_CONNECTION_NAME
                },
                new Lookup()
                {
                    Id = Guid.Parse("704A3D00-62DF-4C62-A4BD-457C4DC242CA"),
                    Name = "Employers",
                    QueryText = $"SELECT dd.LABEL, dd.VALUE, dd.VALUE1, dd.VALUE2 FROM {Constants.DEFAULT_SCHEMA}.DATA_DICTIONARIES dd WHERE dd.CATEGORY = 'Employer' {{{{ AND dd.VALUE1 IN ##VENDOR## }}}} ORDER BY dd.LABEL",
                    DataSourceConnectionName = Constants.DEFAULT_CONNECTION_NAME
                },
                new Lookup()
                {
                    Id = Guid.Parse("8BE7B1D6-F09A-4EEE-B8EC-4DFCF689005B"),
                    Name = "Employers in Editing Form",
                    QueryText = $"SELECT dd.LABEL, dd.VALUE, dd.VALUE1, dd.VALUE2 FROM {Constants.DEFAULT_SCHEMA}.DATA_DICTIONARIES dd WHERE dd.CATEGORY = 'Employer' {{{{ AND dd.VALUE1 = ##VENDOR## }}}} ORDER BY dd.LABEL",
                    DataSourceConnectionName = Constants.DEFAULT_CONNECTION_NAME
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
                DataSourceConnectionName = Constants.DEFAULT_CONNECTION_NAME,
                ItemType = GridItemType.SINGLE,

                DataSourceConfig = JsonSerializer.Serialize(new DataSourceConfig
                {
                    DataSourceConnectionName = Constants.DEFAULT_CONNECTION_NAME,
                    TableName = "USERS",
                    TableSchema = Constants.DEFAULT_SCHEMA,
                    IdColumn = "ID",
                    Columns = new List<string>() { "ID", "USERNAME", "NAME", "EMAIL", "PHONE", "AUTO_EMAIL", "VENDOR", "EMPLOYER", "COMMENTS" },
                    SortBy = new List<SortParam>() { new SortParam { field = "NAME", order = 1 } }
                }),

                ColumnsConfig = JsonSerializer.Serialize(new GridColConfig[] {
                        new GridColConfig { type = "DataBaseField", field = "USERNAME", header = "User ID", width = 130, filterType = "text", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "NAME", header = "Name", width = 250, filterType = "text", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "EMAIL", header = "Email", width = 250, filterType = "text", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "PHONE", header = "Phone", width = 250, filterType = "text", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "AUTO_EMAIL", header = "Auto Email", width = 250, filterType = "boolean", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "VENDOR", header = "Vendor", width = 250, filterType = "text", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "EMPLOYER", header = "Employer", width = 250, filterType = "text", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "COMMENTS", header = "Comments", width = 250, filterType = "text", sortable = true }
                    }),

                SearchConfig = JsonSerializer.Serialize(new SearchFieldConfig[] {
                        new SearchFieldConfig {
                            key = "USERNAME",
                            type = "input",
                            filterType = "text",
                            props = new {
                                label = "User ID",
                                placeholder = "User ID"
                            },
                            searchRule = new SearchFieldFilterRule
                            {
                                field = "USERNAME",
                                matchMode = "contains"
                            }
                        },
                        new SearchFieldConfig {
                            key = "NAME",
                            type = "input",
                            filterType = "text",
                            props = new {
                                label = "Name",
                                placeholder = "Name"
                            },
                            searchRule = new SearchFieldFilterRule
                            {
                                field = "NAME",
                                matchMode = "contains"
                            }
                        },
                        new SearchFieldConfig {
                            key = "ROLES",
                            type = "multiSelect",
                            filterType = "text",
                            props = new {
                                label = "Roles",
                                placeholder = "Please select",
                                optionsLookup = new { id = "727052BA-0033-42C9-A39C-06A103E4B021" }
                            },
                            searchRule = new SearchFieldFilterRule
                            {
                                field = "ROLES",
                                whereClause = $"ID IN (SELECT USER_ID FROM {Constants.DEFAULT_SCHEMA}.USER_PERMISSIONS WHERE PERMISSION_GRANT_ID IN ##VALUE##)"
                            }
                        },
                        new SearchFieldConfig {
                            key = "VENDOR",
                            type = "multiSelect",
                            filterType = "text",
                            props = new {
                                label = "Vendor",
                                placeholder = "Please select",
                                optionsLookup = new { id = "E1F3E2C7-25CA-4D69-9405-ABC54923864D" }
                            },
                            searchRule = new SearchFieldFilterRule
                            {
                                field = "VENDOR",
                                matchMode = "in"
                            }
                        },
                        new SearchFieldConfig {
                            key = "EMPLOYER",
                            type = "multiSelect",
                            filterType = "text",
                            props = new {
                                label = "Employer",
                                placeholder = "Please select",
                                optionsLookup = new {
                                    id = "704A3D00-62DF-4C62-A4BD-457C4DC242CA",
                                    deps = new object[] { "VENDOR" }
                                }
                            },
                            searchRule = new SearchFieldFilterRule
                            {
                                field = "EMPLOYER",
                                matchMode = "in"
                            }
                        }
                    }),

                DetailConfig = JsonSerializer.Serialize(new DetailConfig
                {
                    AddingForm = new GridFormLayout
                    {
                        Enabled = true,
                        UseCustomForm = true,
                        CustomFormName = "user-manager-add"
                    },
                    UpdatingForm = new GridFormLayout
                    {
                        Enabled = true,
                        UseCustomForm = true,
                        CustomFormName = "user-manager-edit"
                    },
                    DeletingForm = new GridFormLayout { Enabled = true }
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
                DataSourceConnectionName = Constants.DEFAULT_CONNECTION_NAME,
                ItemType = GridItemType.SINGLE,

                DataSourceConfig = JsonSerializer.Serialize(new DataSourceConfig
                {
                    DataSourceConnectionName = Constants.DEFAULT_CONNECTION_NAME,
                    TableName = "DEMO_TABLE",
                    TableSchema = Constants.DEFAULT_SCHEMA,
                    IdColumn = "ID",
                    Columns = new List<string>() { },
                    SortBy = new List<SortParam>() { }
                }),

                ColumnsConfig = JsonSerializer.Serialize(new GridColConfig[] {
                        new GridColConfig { type = "DataBaseField", field = "NAME", header = "Name", width = 130, filterType = "text", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "FIRST_NAME", header = "First Name", width = 250, filterType = "text", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "CHECKED", header = "Checked", width = 250, filterType = "boolean", sortable = false },
                        new GridColConfig { type = "DataBaseField", field = "NUMBER", header = "Number", width = 250, filterType = "numeric", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "TOTAL", header = "Total", width = 250, filterType = "numeric", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "CREATE_DATE", header = "Create Date", width = 250, filterType = "date", sortable = true }
                    }),

                SearchConfig = JsonSerializer.Serialize(new SearchFieldConfig[] {
                        new SearchFieldConfig {
                            key = "FIRST_NAME",
                            type = "input",
                            filterType = "text",
                            props = new {
                                label = "First Name",
                                placeholder = "Enter First Name"
                            },
                            searchRule = new SearchFieldFilterRule
                            {
                                field = "FIRST_NAME",
                                matchMode = "contains"
                            }
                        },
                        new SearchFieldConfig {
                            key = "NUMBER",
                            type = "inputNumber",
                            filterType = "numeric",
                            props = new {
                                label = "Number",
                                placeholder = "Enter Number"
                            },
                            searchRule = new SearchFieldFilterRule
                            {
                                field = "NUMBER",
                                matchMode = "gt"
                            }
                        },
                        new SearchFieldConfig {
                            key = "NAME",
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
                                field = "NAME",
                                matchMode = "in"
                            }
                        },
                        new SearchFieldConfig {
                            key = "CREATE_DATE",
                            type = "datepicker",
                            filterType = "date",
                            props = new {
                                label = "Create Date",
                                placeholder = "Please select"
                            },
                            searchRule = new SearchFieldFilterRule
                            {
                                field = "CREATE_DATE",
                                matchMode = "dateAfter"
                            }
                        },
                        new SearchFieldConfig {
                            key = "CHECKED",
                            type = "checkbox",
                            filterType = "boolean",
                            props = new {
                                label = "Checked"
                            },
                            searchRule = new SearchFieldFilterRule
                            {
                                field = "CHECKED",
                                matchMode = "equals"
                            }
                        }
                    }),

                DetailConfig = JsonSerializer.Serialize(new DetailConfig
                {
                    AddingForm = new GridFormLayout
                    {
                        Enabled = true,
                        UseCustomForm = false,
                        FormFields = new List<FormFieldConfig> {
                                new FormFieldConfig
                                {
                                    filterType = "text",
                                    key = "NAME",
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
                                    key = "FIRST_NAME",
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
                                    key = "CHECKED",
                                    type = "checkbox",
                                    defaultValue = false,
                                    props = new
                                    {
                                        label = "Checked",
                                        required = true
                                    }
                                },
                                new FormFieldConfig
                                {
                                    filterType = "numeric",
                                    key = "NUMBER",
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
                                    key = "TOTAL",
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
                                    key = "CREATE_DATE",
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
                        Enabled = true,
                        UseAddingFormLayout = true
                    },
                    DeletingForm = new GridFormLayout { Enabled = true }
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

            var random = new Random();
            for (var i = 0; i < 1000; i++)
            {
                _depDbContext.DemoTables.Add(new DemoTable()
                {
                    Checked = random.Next(0, 100) % 2 == 0,
                    CreateDate = DateTime.Now.AddDays(random.Next(-365 * 3, 365 * 3)),
                    Division = lorem[random.Next(0, 100) % 4],
                    Employor = lorem[random.Next(0, 100) % 4],
                    Vendor = lorem[random.Next(0, 100) % 4],
                    FirstName = names[random.Next(0, 100) % 4],
                    Name = names[random.Next(0, 100) % 4],
                    Number = random.Next(0, 100),
                    Total = (decimal)random.NextDouble() * 100,
                });
            }

            #endregion

            #region Site settings and license

            var licensePath = Path.Combine(Environment.CurrentDirectory, "license.dat");
            _logger.LogInformation("License File Path is: " + licensePath);

            var license = "";
            if (File.Exists(licensePath))
                license = File.ReadAllText(licensePath);

            var setting = new SiteSetting()
            {
                Installed = true,
                SiteName = "Data Editor Portal",
                License = license
            };
            _depDbContext.Add(setting);

            #endregion

            #region Site Content

            var contents = new List<SiteContent>(){
                new SiteContent()
                {
                    ContentName = "about",
                    Content = "About Data Editor Portal"
                },
                new SiteContent()
                {
                    ContentName = "contact",
                    Content = "Contact Data Editor Portal"
                },
            };

            foreach (var item in contents)
            {
                _depDbContext.SiteContents.Add(item);
            }

            #endregion

            _depDbContext.SaveChanges();

            #region LINK DEMO

            var linkLookups = new List<Lookup>() {
                new Lookup()
                {
                    Id = Guid.Parse("140FEA8D-DEA8-4314-8B29-6F1BD140C79A"),
                    Name = "LINK NAME1 OPTIONS",
                    QueryText = $"SELECT DISTINCT NAME1 AS LABEL, NAME1 AS VALUE FROM {Constants.DEFAULT_SCHEMA}.DEMO_LINK_LOOKUP ORDER BY NAME1",
                    DataSourceConnectionName = Constants.DEFAULT_CONNECTION_NAME
                },
                new Lookup()
                {
                    Id = Guid.Parse("EF604385-873D-4229-9685-1D14BE1B484C"),
                    Name = "LINK NAME4 OPTIONS",
                    QueryText = "SELECT DISTINCT NAME4 AS LABEL, NAME4 AS VALUE FROM " + Constants.DEFAULT_SCHEMA + ".DEMO_LINK_LOOKUP WHERE 1=1 {{AND NAME1 = ##NAME1##}} ORDER BY NAME4",
                    DataSourceConnectionName = Constants.DEFAULT_CONNECTION_NAME
                },
                new Lookup()
                {
                    Id = Guid.Parse("44A5D080-876C-42B4-8243-739D2BCEA013"),
                    Name = "LINK NAME5 OPTIONS",
                    QueryText = "SELECT DISTINCT NAME5 AS LABEL, NAME5 AS VALUE FROM " + Constants.DEFAULT_SCHEMA + ".DEMO_LINK_LOOKUP WHERE 1=1 {{AND NAME1 = ##NAME1##}} {{AND NAME4 = ##NAME4##}} ORDER BY NAME5",
                    DataSourceConnectionName = Constants.DEFAULT_CONNECTION_NAME
                },
                new Lookup()
                {
                    Id = Guid.Parse("4F584448-9877-4037-AF0D-1AD2B17AD9F1"),
                    Name = "LINK NAME6 OPTIONS",
                    QueryText = "SELECT DISTINCT NAME6 AS LABEL, NAME6 AS VALUE FROM " + Constants.DEFAULT_SCHEMA + ".DEMO_LINK_LOOKUP WHERE 1=1 {{AND NAME1 = ##NAME1##}} {{AND NAME4 = ##NAME4##}} {{AND NAME5 = ##NAME5##}} ORDER BY NAME6",
                    DataSourceConnectionName = Constants.DEFAULT_CONNECTION_NAME
                },
                new Lookup()
                {
                    Id = Guid.Parse("901B664B-B443-45C1-8F49-B585A845E321"),
                    Name = "LINK NAME3 OPTIONS",
                    QueryText = "SELECT DISTINCT NAME3 AS LABEL, NAME3 AS VALUE FROM " + Constants.DEFAULT_SCHEMA + ".DEMO_LINK_LOOKUP WHERE 1=1 {{AND NAME1 = ##NAME1##}} {{AND NAME4 = ##NAME4##}} {{AND NAME5 = ##NAME5##}} {{AND NAME6 = ##NAME6##}} ORDER BY NAME3",
                    DataSourceConnectionName = Constants.DEFAULT_CONNECTION_NAME
                }
            };
            foreach (var item in linkLookups)
            {
                _depDbContext.Lookups.Add(item);
            }

            var linkDemoMenus = new List<SiteMenu>(){
                new SiteMenu()
                {
                    Id = new Guid("863C0321-F5BE-4145-B182-9F229DDBD792"),
                    Name = "link-table-demo",
                    Label = "Link Table Demo",
                    Icon = "pi pi-sitemap",
                    Type = "Portal Item",
                    Link = "",
                    ParentId = new Guid("41D85A79-9E84-4AB8-AF96-08DAF9CD4412"),
                    Order = 1,
                    Status = PortalItemStatus.Published
                },
                new SiteMenu()
                {
                    Id = new Guid("060B81FF-EBBB-4FA8-BCD5-00568860153F"),
                    Name = "link-primary",
                    Label = "Primary Table",
                    Icon = "pi pi-table",
                    Type = "Sub Portal Item",
                    Link = "",
                    ParentId = new Guid("863C0321-F5BE-4145-B182-9F229DDBD792"),
                    Order = 0,
                    Status = PortalItemStatus.Published
                },
                new SiteMenu()
                {
                    Id = new Guid("9CAB7319-5295-46F0-8879-F58F434C0397"),
                    Name = "link-secondary",
                    Label = "Secondary Table",
                    Icon = "pi pi-table",
                    Type = "Sub Portal Item",
                    Link = "",
                    ParentId = new Guid("863C0321-F5BE-4145-B182-9F229DDBD792"),
                    Order = 1,
                    Status = PortalItemStatus.Published
                }
            };
            foreach (var item in linkDemoMenus)
            {
                var entity = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == item.Id);
                if (entity != null) _depDbContext.SiteMenus.Update(item);
                else _depDbContext.SiteMenus.Add(item);
            }

            var linkDemoCfg = new UniversalGridConfiguration()
            {
                Id = Guid.NewGuid(),
                Name = "link-table-demo",
                ConfigCompleted = true,
                DataSourceConnectionName = Constants.DEFAULT_CONNECTION_NAME,
                ItemType = GridItemType.LINKED,

                DataSourceConfig = JsonSerializer.Serialize(new LinkedDataSourceConfig
                {
                    LinkTable = new RelationDataSourceConfig()
                    {
                        DataSourceConnectionName = Constants.DEFAULT_CONNECTION_NAME,
                        TableName = "DEMO_LINK_RELATION",
                        TableSchema = Constants.DEFAULT_SCHEMA,
                        IdColumn = "OBJECTID",
                        PrimaryForeignKey = "LEFTID",
                        PrimaryReferenceKey = "OBJECTID",
                        SecondaryForeignKey = "RIGHTID",
                        SecondaryReferenceKey = "OBJECTID"
                    },
                    PrimaryTable = new LinkedTableConfig()
                    {
                        Id = new Guid("060B81FF-EBBB-4FA8-BCD5-00568860153F"),
                        ColumnsForLinkedField = new List<string>() { "NAME", "TYPE", "STATUS1", "DATETIME1", "DATETIME3", "COMMENTS" },
                    },
                    SecondaryTable = new LinkedTableConfig()
                    {
                        Id = new Guid("9CAB7319-5295-46F0-8879-F58F434C0397"),
                        ColumnsForLinkedField = new List<string>() { "TYPE", "STATUS1", "DATETIME3", "COMMENTS" },
                    }
                }),

                SearchConfig = JsonSerializer.Serialize(new SearchFieldConfig[] {
                    new SearchFieldConfig {
                        key = "NAME1",
                        type = "select",
                        filterType = "text",
                        props = new {
                            label = "NAME1",
                            placeholder = "Select Name1...",
                            optionsLookup = new { id = "140FEA8D-DEA8-4314-8B29-6F1BD140C79A" }
                        },
                        searchRule = new SearchFieldFilterRule
                        {
                            field = "NAME1",
                            matchMode = "equals"
                        },
                        searchRule1 = new SearchFieldFilterRule
                        {
                            field = "NAME1",
                            matchMode = "equals"
                        }
                    },
                    new SearchFieldConfig {
                        key = "NAME4",
                        type = "select",
                        filterType = "text",
                        props = new {
                            label = "NAME4",
                            placeholder = "Select Name4...",
                            optionsLookup = new {
                                id = "EF604385-873D-4229-9685-1D14BE1B484C",
                                deps = new object[]{ "NAME1" }
                            },
                        },
                        searchRule = new SearchFieldFilterRule
                        {
                            field = "NAME4",
                            matchMode = "equals"
                        },
                        searchRule1 = new SearchFieldFilterRule
                        {
                            field = "NAME4",
                            matchMode = "equals"
                        }
                    },
                    new SearchFieldConfig {
                        key = "NAME5",
                        type = "select",
                        filterType = "text",
                        props = new {
                            label = "NAME5",
                            placeholder = "Select Name5...",
                            optionsLookup = new {
                                id = "44A5D080-876C-42B4-8243-739D2BCEA013",
                                deps = new object[]{ "NAME1", "NAME4" }
                            }
                        },
                        searchRule = new SearchFieldFilterRule
                        {
                            field = "NAME5",
                            matchMode = "equals"
                        },
                        searchRule1 = new SearchFieldFilterRule
                        {
                            field = "NAME5",
                            matchMode = "equals"
                        }
                    },
                    new SearchFieldConfig {
                        key = "NAME6",
                        type = "select",
                        filterType = "text",
                        props = new {
                            label = "NAME6",
                            placeholder = "Select Name6...",
                            optionsLookup = new {
                                id = "4F584448-9877-4037-AF0D-1AD2B17AD9F1",
                                deps = new object[]{ "NAME1", "NAME4", "NAME5" }
                            }
                        },
                        searchRule = new SearchFieldFilterRule
                        {
                            field = "NAME6",
                            matchMode = "equals"
                        },
                        searchRule1 = new SearchFieldFilterRule
                        {
                            field = "NAME6",
                            matchMode = "equals"
                        }
                    },
                    new SearchFieldConfig {
                        key = "NAME3",
                        type = "select",
                        filterType = "text",
                        props = new {
                            label = "NAME3",
                            placeholder = "Select Name3...",
                            optionsLookup = new {
                                id = "901B664B-B443-45C1-8F49-B585A845E321",
                                deps = new object[]{ "NAME1", "NAME4", "NAME5", "NAME6" }
                            }
                        },
                        searchRule = new SearchFieldFilterRule
                        {
                            field = "NAME3",
                            matchMode = "equals"
                        },
                        searchRule1 = new SearchFieldFilterRule
                        {
                            field = "NAME3",
                            matchMode = "equals"
                        }
                    }
                })
            };
            _depDbContext.UniversalGridConfigurations.Add(linkDemoCfg);
            var linkPrimaryCfg = new UniversalGridConfiguration()
            {
                Id = new Guid("D13087B3-F5DD-466D-AAFC-C73582C31473"),
                Name = "link-primary",
                ConfigCompleted = true,
                DataSourceConnectionName = Constants.DEFAULT_CONNECTION_NAME,
                ItemType = GridItemType.LINKED_SINGLE,

                DataSourceConfig = JsonSerializer.Serialize(new DataSourceConfig
                {
                    DataSourceConnectionName = Constants.DEFAULT_CONNECTION_NAME,
                    QueryText = $"SELECT * FROM {Constants.DEFAULT_SCHEMA}.DEMO_LINK_PRIMARY l \nLEFT JOIN {Constants.DEFAULT_SCHEMA}.DEMO_LINK_LOOKUP gshm ON l.BOUNDARYGLOBALID = gshm.LOOKUPID \nWHERE ##WHERE## AND ##SEARCHES## AND ##FILTERS## ORDER BY ##ORDERBY##",
                    IdColumn = "OBJECTID",
                    SortBy = new List<SortParam>() { new SortParam { field = "NAME", order = 1 } }
                }),

                ColumnsConfig = JsonSerializer.Serialize(new GridColConfig[] {
                    new GridColConfig { type = "DataBaseField", field = "NAME6", header = "NAME6", width = 250, filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "NAME3", header = "NAME3", width = 250, filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "NAME", header = "NAME", width = 250, filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "TYPE", header = "TYPE", width = 250, filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "STATUS1", header = "STATUS1", width = 250, filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "DATETIME1", header = "DATETIME1", width = 250, filterType = "date", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "CRITERIA", header = "CRITERIA", width = 250, filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "ASSESSEDBY", header = "ASSESSEDBY", width = 250, filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "DATETIME2", header = "DATETIME2", width = 250, filterType = "date", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "DATETIME3", header = "DATETIME3", width = 250, filterType = "date", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "DATETIME4", header = "DATETIME4", width = 250, filterType = "date", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "COMMENTS", header = "COMMENTS", width = 250, filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "STATUS", header = "STATUS", width = 250, filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "CREATIONUSER", header = "CREATIONUSER", width = 250, filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "LASTUSER", header = "LASTUSER", width = 250, filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "DATEMODIFIED", header = "DATEMODIFIED", width = 250, filterType = "date", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "DATECREATED", header = "DATECREATED", width = 250, filterType = "date", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "GLOBALID", header = "GLOBALID", width = 250, filterType = "text", sortable = true }
                }),

                SearchConfig = JsonSerializer.Serialize(new SearchFieldConfig[] {
                    new SearchFieldConfig {
                        key = "NAME1",
                        type = "select",
                        filterType = "text",
                        props = new {
                            label = "NAME1",
                            placeholder = "Select NAME1..."
                        },
                        searchRule = new SearchFieldFilterRule
                        {
                            field = "NAME1",
                            matchMode = "equals"
                        }
                    },
                    new SearchFieldConfig {
                        key = "NAME4",
                        type = "select",
                        filterType = "text",
                        props = new {
                            label = "NAME4",
                            placeholder = "Select NAME4..."
                        },
                        searchRule = new SearchFieldFilterRule
                        {
                            field = "NAME4",
                            matchMode = "equals"
                        }
                    },
                    new SearchFieldConfig {
                        key = "NAME5",
                        type = "select",
                        filterType = "text",
                        props = new {
                            label = "NAME5",
                            placeholder = "Select NAME5..."
                        },
                        searchRule = new SearchFieldFilterRule
                        {
                            field = "NAME5",
                            matchMode = "equals"
                        }
                    },
                    new SearchFieldConfig {
                        key = "NAME6",
                        type = "select",
                        filterType = "text",
                        props = new {
                            label = "NAME6",
                            placeholder = "Select NAME6..."
                        },
                        searchRule = new SearchFieldFilterRule
                        {
                            field = "NAME6",
                            matchMode = "equals"
                        }
                    },
                    new SearchFieldConfig {
                        key = "NAME3",
                        type = "select",
                        filterType = "text",
                        props = new {
                            label = "NAME3",
                            placeholder = "Select NAME3..."
                        },
                        searchRule = new SearchFieldFilterRule
                        {
                            field = "NAME3",
                            matchMode = "equals"
                        }
                    }
                }),

                DetailConfig = JsonSerializer.Serialize(new DetailConfig
                {
                    AddingForm = new GridFormLayout
                    {
                        Enabled = true,
                        FormFields = new List<FormFieldConfig>() {
                            new FormFieldConfig()
                            {
                                filterType = "text",
                                key = "NAME",
                                type = "input",
                                props = new
                                {
                                    label = "NAME"
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "text",
                                key = "TYPE",
                                type = "select",
                                props = new
                                {
                                    label = "TYPE",
                                    optionsLookup = new object[]
                                    {
                                        new { label = "TYPE 1", value = "TYPE 1" },
                                        new { label = "TYPE 2", value = "TYPE 2" },
                                        new { label = "TYPE 3", value = "TYPE 3" }
                                    }
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "text",
                                key = "STATUS1",
                                type = "select",
                                props = new
                                {
                                    label = "STATUS1",
                                    optionsLookup = new object[]
                                    {
                                        new { label = "STATUS 1", value = "STATUS 1" },
                                        new { label = "STATUS 2", value = "STATUS 2" }
                                    }
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "date",
                                key = "DATETIME1",
                                type = "datepicker",
                                props = new
                                {
                                    label = "DATETIME1"
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "text",
                                key = "CRITERIA",
                                type = "select",
                                props = new
                                {
                                    label = "CRITERIA",
                                    optionsLookup = new object[]
                                    {
                                        new { label = "CRITERIA 1", value = "CRITERIA 1" },
                                        new { label = "CRITERIA 2", value = "CRITERIA 2" }
                                    }
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "text",
                                key = "ASSESSEDBY",
                                type = "select",
                                props = new
                                {
                                    label = "ASSESSEDBY",
                                    optionsLookup = new object[]
                                    {
                                        new { label = "Allee, Jim", value = "Allee, Jim" },
                                        new { label = "Allen, Douglas", value = "Allen, Douglas" },
                                        new { label = "Anderson, George", value = "Anderson, George" }
                                    }
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "date",
                                key = "DATETIME2",
                                type = "datepicker",
                                props = new
                                {
                                    label = "DATETIME2"
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "date",
                                key = "DATETIME3",
                                type = "datepicker",
                                props = new
                                {
                                    label = "DATETIME3"
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "date",
                                key = "DATETIME4",
                                type = "datepicker",
                                props = new
                                {
                                    label = "DATETIME4"
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "text",
                                key = "COMMENTS",
                                type = "textarea",
                                props = new
                                {
                                    label = "COMMENTS"
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "linkDataField",
                                key = "LINK_DATA_FIELD",
                                type = "linkDataEditor",
                                props = new
                                {
                                    label = "SECONDARY DATA"
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "date",
                                key = "DATECREATED",
                                type = "datepicker",
                                props = new
                                {
                                    label = "DATECREATED"
                                },
                                computedConfig = new ComputedConfig()
                                {
                                    name = ComputedValueName.CurrentDateTime
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "date",
                                key = "DATEMODIFIED",
                                type = "datepicker",
                                props = new
                                {
                                    label = "DATEMODIFIED"
                                },
                                computedConfig = new ComputedConfig()
                                {
                                    name = ComputedValueName.CurrentDateTime
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "text",
                                key = "BOUNDARYGLOBALID",
                                type = "input",
                                props = new
                                {
                                    label = "BOUNDARYGLOBALID"
                                },
                                computedConfig = new ComputedConfig()
                                {
                                    type = System.Data.CommandType.Text,
                                    queryText =
                                        IsOracle()
                                        ? "SELECT LOOKUPID FROM " + Constants.DEFAULT_SCHEMA + ".DEMO_LINK_LOOKUP gshm WHERE rownum=1 ORDER BY NAME3"
                                        : IsSqlConnection()
                                        ? "SELECT TOP 1 LOOKUPID FROM " + Constants.DEFAULT_SCHEMA + ".DEMO_LINK_LOOKUP gshm ORDER BY NAME3 "
                                        : ""
                                }
                            },
                        },
                        QueryText =
                            IsOracle()
                            ? $"INSERT INTO {Constants.DEFAULT_SCHEMA}.DEMO_LINK_PRIMARY \n(NAME,\u0022TYPE\u0022,STATUS1,DATETIME1,CRITERIA,ASSESSEDBY,DATETIME2,DATETIME3,DATETIME4,COMMENTS,DATECREATED,BOUNDARYGLOBALID) \nVALUES (##NAME##,##TYPE##,##STATUS1##,##DATETIME1##,##CRITERIA##,##ASSESSEDBY##,##DATETIME2##,##DATETIME3##,##DATETIME4##,##COMMENTS##,##DATECREATED##,##BOUNDARYGLOBALID##)\nRETURNING OBJECTID INTO ##RETURNED_OBJECTID##"
                            : IsSqlConnection()
                            ? $"DECLARE @InsertedIDResults TABLE (ID NVARCHAR(40)); \nINSERT INTO {Constants.DEFAULT_SCHEMA}.DEMO_LINK_PRIMARY (NAME,\u0022TYPE\u0022,STATUS1,DATETIME1,CRITERIA,ASSESSEDBY,DATETIME2,DATETIME3,DATETIME4,COMMENTS,DATECREATED,BOUNDARYGLOBALID) \nOUTPUT INSERTED.OBJECTID INTO @InsertedIDResults \nVALUES (##NAME##,##TYPE##,##STATUS1##,##DATETIME1##,##CRITERIA##,##ASSESSEDBY##,##DATETIME2##,##DATETIME3##,##DATETIME4##,##COMMENTS##,##DATECREATED##,##BOUNDARYGLOBALID##);\nSET ##RETURNED_OBJECTID## = (SELECT TOP 1 ID FROM @InsertedIDResults);"
                            : ""
                    },
                    UpdatingForm = new GridFormLayout
                    {
                        Enabled = true,
                        UseAddingFormLayout = true,
                        QueryText = $"UPDATE {Constants.DEFAULT_SCHEMA}.DEMO_LINK_PRIMARY SET NAME=##NAME##,\u0022TYPE\u0022=##TYPE##,STATUS1=##STATUS1##,DATETIME1=##DATETIME1##,CRITERIA=##CRITERIA##,ASSESSEDBY=##ASSESSEDBY##,DATETIME2=##DATETIME2##,DATETIME3=##DATETIME3##,DATETIME4=##DATETIME4##,COMMENTS=##COMMENTS##,DATEMODIFIED=##DATEMODIFIED## WHERE OBJECTID=##OBJECTID##"
                    },
                    DeletingForm = new GridFormLayout
                    {
                        Enabled = true,
                        UseAddingFormLayout = true,
                        QueryText = $"DELETE FROM {Constants.DEFAULT_SCHEMA}.DEMO_LINK_PRIMARY WHERE OBJECTID IN ##OBJECTID##"
                    }
                }),
            };
            _depDbContext.UniversalGridConfigurations.Add(linkPrimaryCfg);
            var linkSecondaryCfg = new UniversalGridConfiguration()
            {
                Id = new Guid("8797B3BB-E6C5-4E54-83C2-88D78E8AAA05"),
                Name = "link-secondary",
                ConfigCompleted = true,
                DataSourceConnectionName = Constants.DEFAULT_CONNECTION_NAME,
                ItemType = GridItemType.LINKED_SINGLE,

                DataSourceConfig = JsonSerializer.Serialize(new DataSourceConfig
                {
                    DataSourceConnectionName = Constants.DEFAULT_CONNECTION_NAME,
                    QueryText = $"SELECT * FROM {Constants.DEFAULT_SCHEMA}.DEMO_LINK_SECONDARY l \nLEFT JOIN {Constants.DEFAULT_SCHEMA}.DEMO_LINK_LOOKUP gshm ON l.BOUNDARYGLOBALID = gshm.LOOKUPID \nWHERE ##WHERE## AND ##SEARCHES## AND ##FILTERS## ORDER BY ##ORDERBY##",
                    IdColumn = "OBJECTID",
                    PageSize = 100,
                    SortBy = new List<SortParam>() { new SortParam { field = "NAME3", order = 1 } }
                }),

                ColumnsConfig = JsonSerializer.Serialize(new GridColConfig[] {
                    new GridColConfig { type = "DataBaseField", field = "NAME6", header = "NAME6", width = 250, filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "NAME3", header = "NAME3", width = 250, filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "TYPE", header = "TYPE", width = 250, filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "STATUS1", header = "STATUS1", width = 250, filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "ASSIGNEDTO", header = "ASSIGNEDTO", width = 250, filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "DATETIME3", header = "DATETIME3", width = 250, filterType = "date", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "DATETIME4", header = "DATETIME4", width = 250, filterType = "date", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "COMMENTS", header = "COMMENTS", width = 250, filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "STATUS", header = "STATUS", width = 250, filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "CREATIONUSER", header = "CREATIONUSER", width = 250, filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "LASTUSER", header = "LASTUSER", width = 250, filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "DATEMODIFIED", header = "DATEMODIFIED", width = 250, filterType = "date", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "DATECREATED", header = "DATECREATED", width = 250, filterType = "date", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "GLOBALID", header = "GLOBALID", width = 250, filterType = "text", sortable = true }
                }),

                SearchConfig = JsonSerializer.Serialize(new SearchFieldConfig[] {
                    new SearchFieldConfig {
                        key = "NAME1",
                        type = "select",
                        filterType = "text",
                        props = new {
                            label = "NAME1",
                            placeholder = "Select NAME1..."
                        },
                        searchRule = new SearchFieldFilterRule
                        {
                            field = "NAME1",
                            matchMode = "equals"
                        }
                    },
                    new SearchFieldConfig {
                        key = "NAME4",
                        type = "select",
                        filterType = "text",
                        props = new {
                            label = "NAME4",
                            placeholder = "Select NAME4..."
                        },
                        searchRule = new SearchFieldFilterRule
                        {
                            field = "NAME4",
                            matchMode = "equals"
                        }
                    },
                    new SearchFieldConfig {
                        key = "NAME5",
                        type = "select",
                        filterType = "text",
                        props = new {
                            label = "NAME5",
                            placeholder = "Select NAME5..."
                        },
                        searchRule = new SearchFieldFilterRule
                        {
                            field = "NAME5",
                            matchMode = "equals"
                        }
                    },
                    new SearchFieldConfig {
                        key = "NAME6",
                        type = "select",
                        filterType = "text",
                        props = new {
                            label = "NAME6",
                            placeholder = "Select NAME6..."
                        },
                        searchRule = new SearchFieldFilterRule
                        {
                            field = "NAME6",
                            matchMode = "equals"
                        }
                    },
                    new SearchFieldConfig {
                        key = "NAME3",
                        type = "select",
                        filterType = "text",
                        props = new {
                            label = "NAME3",
                            placeholder = "Select NAME3..."
                        },
                        searchRule = new SearchFieldFilterRule
                        {
                            field = "NAME3",
                            matchMode = "equals"
                        }
                    }
                }),

                DetailConfig = JsonSerializer.Serialize(new DetailConfig
                {
                    AddingForm = new GridFormLayout
                    {
                        Enabled = true,
                        FormFields = new List<FormFieldConfig>() {
                            new FormFieldConfig()
                            {
                                filterType = "text",
                                key = "TYPE",
                                type = "select",
                                props = new
                                {
                                    label = "TYPE",
                                    optionsLookup = new object[]
                                    {
                                        new { label = "TYPE 1", value = "TYPE 1" },
                                        new { label = "TYPE 2", value = "TYPE 2" },
                                        new { label = "TYPE 3", value = "TYPE 3" },
                                        new { label = "TYPE 4", value = "TYPE 4" },
                                        new { label = "TYPE 5", value = "TYPE 5" }
                                    }
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "text",
                                key = "STATUS1",
                                type = "select",
                                props = new
                                {
                                    label = "STATUS1",
                                    optionsLookup = new object[]
                                    {
                                        new { label = "STATUS 1", value = "STATUS 1" },
                                        new { label = "STATUS 2", value = "STATUS 2" }
                                    }
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "text",
                                key = "ASSIGNEDTO",
                                type = "select",
                                props = new
                                {
                                    label = "ASSIGNEDTO",
                                    optionsLookup = new object[]
                                    {
                                        new { label = "Allee, Jim", value = "Allee, Jim" },
                                        new { label = "Allen, Douglas", value = "Allen, Douglas" },
                                        new { label = "Anderson, George", value = "Anderson, George" }
                                    }
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "date",
                                key = "DATETIME3",
                                type = "datepicker",
                                props = new
                                {
                                    label = "DATETIME3"
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "date",
                                key = "DATETIME4",
                                type = "datepicker",
                                props = new
                                {
                                    label = "DATETIME4"
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "text",
                                key = "COMMENTS",
                                type = "textarea",
                                props = new
                                {
                                    label = "COMMENTS"
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "linkDataField",
                                key = "LINK_DATA_FIELD",
                                type = "linkDataEditor",
                                props = new
                                {
                                    label = "PRIMARY DATA"
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "date",
                                key = "DATECREATED",
                                type = "datepicker",
                                props = new
                                {
                                    label = "DATECREATED"
                                },
                                computedConfig = new ComputedConfig()
                                {
                                    name = ComputedValueName.CurrentDateTime
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "date",
                                key = "DATEMODIFIED",
                                type = "datepicker",
                                props = new
                                {
                                    label = "DATEMODIFIED"
                                },
                                computedConfig = new ComputedConfig()
                                {
                                    name = ComputedValueName.CurrentDateTime
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "text",
                                key = "BOUNDARYGLOBALID",
                                type = "input",
                                props = new
                                {
                                    label = "BOUNDARYGLOBALID"
                                },
                                computedConfig = new ComputedConfig()
                                {
                                    type = System.Data.CommandType.Text,
                                    queryText =
                                        IsOracle()
                                        ? "SELECT LOOKUPID FROM " + Constants.DEFAULT_SCHEMA + ".DEMO_LINK_LOOKUP gshm WHERE rownum=1 ORDER BY NAME3"
                                        : IsSqlConnection()
                                        ? "SELECT TOP 1 LOOKUPID FROM " + Constants.DEFAULT_SCHEMA + ".DEMO_LINK_LOOKUP gshm ORDER BY NAME3 "
                                        : ""
                                }
                            },
                        },
                        QueryText =
                            IsOracle()
                            ? $"INSERT INTO {Constants.DEFAULT_SCHEMA}.DEMO_LINK_SECONDARY (\u0022TYPE\u0022,STATUS1,ASSIGNEDTO,DATETIME3,DATETIME4,COMMENTS,DATECREATED,BOUNDARYGLOBALID) \nVALUES (##TYPE##,##STATUS1##,##ASSIGNEDTO##,##DATETIME3##,##DATETIME4##,##COMMENTS##,##DATECREATED##,##BOUNDARYGLOBALID##)\nRETURNING OBJECTID INTO ##RETURNED_OBJECTID##"
                            : IsSqlConnection()
                            ? $"DECLARE @InsertedIDResults TABLE (ID NVARCHAR(40)); \nINSERT INTO {Constants.DEFAULT_SCHEMA}.DEMO_LINK_SECONDARY (\u0022TYPE\u0022,STATUS1,ASSIGNEDTO,DATETIME3,DATETIME4,COMMENTS,DATECREATED,BOUNDARYGLOBALID) \nOUTPUT INSERTED.OBJECTID INTO @InsertedIDResults \nVALUES (##TYPE##,##STATUS1##,##ASSIGNEDTO##,##DATETIME3##,##DATETIME4##,##COMMENTS##,##DATECREATED##,##BOUNDARYGLOBALID##);\nSET ##RETURNED_OBJECTID## = (SELECT TOP 1 ID FROM @InsertedIDResults);"
                            : ""
                    },
                    UpdatingForm = new GridFormLayout
                    {
                        Enabled = true,
                        UseAddingFormLayout = true,
                        QueryText = $"UPDATE {Constants.DEFAULT_SCHEMA}.DEMO_LINK_SECONDARY SET \u0022TYPE\u0022=##TYPE##,STATUS1=##STATUS1##,ASSIGNEDTO=##ASSIGNEDTO##,DATETIME3=##DATETIME3##,DATETIME4=##DATETIME4##,COMMENTS=##COMMENTS##,DATEMODIFIED=##DATEMODIFIED## WHERE OBJECTID = ##OBJECTID##"
                    },
                    DeletingForm = new GridFormLayout
                    {
                        Enabled = true,
                        UseAddingFormLayout = true,
                        QueryText = $"DELETE FROM {Constants.DEFAULT_SCHEMA}.DEMO_LINK_SECONDARY WHERE OBJECTID IN ##OBJECTID##"
                    }
                })
            };
            _depDbContext.UniversalGridConfigurations.Add(linkSecondaryCfg);

            var linkPermissions = new List<SitePermission>() {
                new SitePermission()
                {
                    Id = Guid.NewGuid(),
                    Category = $"Portal Item: Link Table Demo",
                    PermissionName = $"VIEW_LINK_TABLE_DEMO".ToUpper(),
                    PermissionDescription = $"View Link Table Demo"
                },
                new SitePermission()
                {
                    Id = Guid.NewGuid(),
                    Category = $"Portal Item: Primary Table",
                    PermissionName = $"ADD_LINK_PRIMARY".ToUpper(),
                    PermissionDescription = $"Add Primary Table"
                },
                new SitePermission()
                {
                    Id = Guid.NewGuid(),
                    Category = $"Portal Item: Primary Table",
                    PermissionName = $"EDIT_LINK_PRIMARY".ToUpper(),
                    PermissionDescription = $"Edit Primary Table"
                },
                new SitePermission()
                {
                    Id = Guid.NewGuid(),
                    Category = $"Portal Item: Primary Table",
                    PermissionName = $"DELETE_LINK_PRIMARY".ToUpper(),
                    PermissionDescription = $"Delete Primary Table"
                },
                new SitePermission()
                {
                    Id = Guid.NewGuid(),
                    Category = $"Portal Item: Primary Table",
                    PermissionName = $"EXPORT_LINK_PRIMARY".ToUpper(),
                    PermissionDescription = $"Export Primary Table"
                },
                new SitePermission()
                {
                    Id = Guid.NewGuid(),
                    Category = $"Portal Item: Secondary Table",
                    PermissionName = $"ADD_LINK_SECONDARY".ToUpper(),
                    PermissionDescription = $"Add Secondary Table"
                },
                new SitePermission()
                {
                    Id = Guid.NewGuid(),
                    Category = $"Portal Item: Secondary Table",
                    PermissionName = $"EDIT_LINK_SECONDARY".ToUpper(),
                    PermissionDescription = $"Edit Secondary Table"
                },
                new SitePermission()
                {
                    Id = Guid.NewGuid(),
                    Category = $"Portal Item: Secondary Table",
                    PermissionName = $"DELETE_LINK_SECONDARY".ToUpper(),
                    PermissionDescription = $"Delete Secondary Table"
                },
                new SitePermission()
                {
                    Id = Guid.NewGuid(),
                    Category = $"Portal Item: Secondary Table",
                    PermissionName = $"EXPORT_LINK_SECONDARY".ToUpper(),
                    PermissionDescription = $"Export Secondary Table"
                }
            };
            foreach (var item in linkPermissions)
            {
                _depDbContext.SitePermissions.Add(item);
            }

            var name1 = LoremIpsumGenerator.GenerateLoremIpsum(2);
            var name4 = LoremIpsumGenerator.GenerateLoremIpsum(6);
            var name5 = LoremIpsumGenerator.GenerateLoremIpsum(30);
            var name6 = LoremIpsumGenerator.GenerateLoremIpsum(50);
            var name2 = LoremIpsumGenerator.GenerateLoremIpsum(100);
            var name3 = LoremIpsumGenerator.GenerateLoremIpsum(300);

            var random1 = new Random();
            foreach (var name in name3)
            {
                var index = random.Next(0, 100) % 2;
                _depDbContext.DEMO_LINK_LOOKUP.Add(new DEMO_LINK_LOOKUP()
                {
                    LOOKUPID = Guid.NewGuid().ToString("B"),
                    NAME1 = name1[random.Next(0, name1.Length + 1) % name1.Length],
                    NAME4 = name4[random.Next(0, name4.Length + 1) % name4.Length],
                    NAME5 = name5[random.Next(0, name5.Length + 1) % name5.Length],
                    NAME6 = name6[random.Next(0, name6.Length + 1) % name6.Length],
                    NAME3 = name,
                    NAME2 = name2[random.Next(0, name2.Length + 1) % name2.Length],
                });
            }
            _depDbContext.SaveChanges();

            #endregion
        }
    }

    public class LoremIpsumGenerator
    {
        private static readonly string[] LoremIpsumWords = {
        "Lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
        "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua",
        "Ut", "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris",
        "nisi", "ut", "aliquip", "ex", "ea", "commodo", "consequat", "Duis", "aute", "irure", "dolor",
        "in", "reprehenderit", "in", "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat",
        "nulla", "pariatur", "Excepteur", "sint", "occaecat", "cupidatat", "non", "proident", "sunt",
        "in", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"
    };

        private static readonly Random random = new Random();

        public static string[] GenerateLoremIpsum(int numberOfStrings)
        {
            List<string> result = new List<string>();

            for (int i = 0; i < numberOfStrings; i++)
            {
                int numberOfWords = random.Next(2, 6); // Random number of words between 2 and 5
                StringBuilder loremIpsumText = new StringBuilder();

                for (int j = 0; j < numberOfWords; j++)
                {
                    int index = random.Next(LoremIpsumWords.Length);
                    loremIpsumText.Append(LoremIpsumWords[index]);

                    if (j < numberOfWords - 1)
                    {
                        loremIpsumText.Append(" ");
                    }
                }

                result.Add(loremIpsumText.ToString());
            }

            return result.ToArray();
        }
    }
}
