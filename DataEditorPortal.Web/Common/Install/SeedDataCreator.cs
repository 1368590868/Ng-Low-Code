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
                    QueryText = $"SELECT sr.ROLE_NAME AS LABEL, sr.ID AS VALUE FROM {Constants.DEFAULT_SCHEMA}.SITE_ROLES sr ORDER BY sr.ROLE_NAME",
                    DataSourceConnectionId = new Guid("4DEFF6DB-D3D6-447F-B3DE-CE2D8B242E36")
                },
                new Lookup()
                {
                    Id = Guid.Parse("E1F3E2C7-25CA-4D69-9405-ABC54923864D"),
                    Name = "Vendors",
                    QueryText = $"SELECT dd.LABEL, dd.VALUE FROM {Constants.DEFAULT_SCHEMA}.DATA_DICTIONARIES dd WHERE dd.CATEGORY = 'Vendor' ORDER BY dd.LABEL",
                    DataSourceConnectionId = new Guid("4DEFF6DB-D3D6-447F-B3DE-CE2D8B242E36")
                },
                new Lookup()
                {
                    Id = Guid.Parse("704A3D00-62DF-4C62-A4BD-457C4DC242CA"),
                    Name = "Employers",
                    QueryText = $"SELECT dd.LABEL, dd.VALUE, dd.VALUE1, dd.VALUE2 FROM {Constants.DEFAULT_SCHEMA}.DATA_DICTIONARIES dd WHERE dd.CATEGORY = 'Employer' {{{{ AND dd.VALUE1 IN ##VENDOR## }}}} ORDER BY dd.LABEL",
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
                ItemType = GridItemType.SINGLE,

                DataSourceConfig = JsonSerializer.Serialize(new DataSourceConfig
                {
                    DataSourceConnectionId = Guid.Parse("4DEFF6DB-D3D6-447F-B3DE-CE2D8B242E36"),
                    TableName = "USERS",
                    TableSchema = Constants.DEFAULT_SCHEMA,
                    IdColumn = "ID",
                    Columns = new List<string>() { "ID", "USERNAME", "NAME", "EMAIL", "PHONE", "AUTO_EMAIL", "VENDOR", "EMPLOYER", "COMMENTS" },
                    SortBy = new List<SortParam>() { new SortParam { field = "NAME", order = 1 } }
                }),

                ColumnsConfig = JsonSerializer.Serialize(new GridColConfig[] {
                        new GridColConfig { type = "DataBaseField", field = "USERNAME", header = "User ID", width = "130px", filterType = "text", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "NAME", header = "Name", width = "250px", filterType = "text", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "EMAIL", header = "Email", width = "250px", filterType = "text", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "PHONE", header = "Phone", width = "250px", filterType = "text", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "AUTO_EMAIL", header = "Auto Email", width = "250px", filterType = "boolean", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "VENDOR", header = "Vendor", width = "250px", filterType = "text", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "EMPLOYER", header = "Employer", width = "250px", filterType = "text", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "COMMENTS", header = "Comments", width = "250px", filterType = "text", sortable = true }
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
                                optionsLookup = "727052BA-0033-42C9-A39C-06A103E4B021"
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
                                optionsLookup = "E1F3E2C7-25CA-4D69-9405-ABC54923864D"
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
                                optionsLookup = "704A3D00-62DF-4C62-A4BD-457C4DC242CA",
                                dependOnFields = new object[]{ "VENDOR" }
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
                ItemType = GridItemType.SINGLE,

                DataSourceConfig = JsonSerializer.Serialize(new DataSourceConfig
                {
                    DataSourceConnectionId = Guid.Parse("4DEFF6DB-D3D6-447F-B3DE-CE2D8B242E36"),
                    TableName = "DEMO_TABLE",
                    TableSchema = Constants.DEFAULT_SCHEMA,
                    IdColumn = "ID",
                    Columns = new List<string>() { },
                    SortBy = new List<SortParam>() { }
                }),

                ColumnsConfig = JsonSerializer.Serialize(new GridColConfig[] {
                        new GridColConfig { type = "DataBaseField", field = "NAME", header = "Name", width = "130px", filterType = "text", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "FIRST_NAME", header = "First Name", width = "250px", filterType = "text", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "CHECKED", header = "Checked", width = "250px", filterType = "boolean", sortable = false },
                        new GridColConfig { type = "DataBaseField", field = "NUMBER", header = "Number", width = "250px", filterType = "numeric", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "TOTAL", header = "Total", width = "250px", filterType = "numeric", sortable = true },
                        new GridColConfig { type = "DataBaseField", field = "CREATE_DATE", header = "Create Date", width = "250px", filterType = "date", sortable = true }
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

            // LPA Demo
            #region LPA DEMO

            // LPA Demo
            #region LPA DEMO

            var lpaLookups = new List<Lookup>() {
                new Lookup()
                {
                    Id = Guid.Parse("140FEA8D-DEA8-4314-8B29-6F1BD140C79A"),
                    Name = "LPA DOT Operators",
                    QueryText = $"SELECT DISTINCT DOT_OPERATOR_NAME AS LABEL, DOT_OPERATOR_NAME AS VALUE FROM {Constants.DEFAULT_SCHEMA}.GFORM_SITE_HIERARCHY_MV ORDER BY DOT_OPERATOR_NAME",
                    DataSourceConnectionId = new Guid("4DEFF6DB-D3D6-447F-B3DE-CE2D8B242E36")
                },
                new Lookup()
                {
                    Id = Guid.Parse("EF604385-873D-4229-9685-1D14BE1B484C"),
                    Name = "LPA Divisions",
                    QueryText = "SELECT DISTINCT DIVISION_NAME AS LABEL, DIVISION_NAME AS VALUE FROM " + Constants.DEFAULT_SCHEMA + ".GFORM_SITE_HIERARCHY_MV WHERE 1=1 {{AND DOT_OPERATOR_NAME = ##DOT_OPERATOR_NAME##}} ORDER BY DIVISION_NAME",
                    DataSourceConnectionId = new Guid("4DEFF6DB-D3D6-447F-B3DE-CE2D8B242E36")
                },
                new Lookup()
                {
                    Id = Guid.Parse("44A5D080-876C-42B4-8243-739D2BCEA013"),
                    Name = "LPA areas",
                    QueryText = "SELECT DISTINCT AREA_NAME AS LABEL, AREA_NAME AS VALUE FROM " + Constants.DEFAULT_SCHEMA + ".GFORM_SITE_HIERARCHY_MV WHERE 1=1 {{AND DOT_OPERATOR_NAME = ##DOT_OPERATOR_NAME##}} {{AND DIVISION_NAME = ##DIVISION_NAME##}} ORDER BY AREA_NAME",
                    DataSourceConnectionId = new Guid("4DEFF6DB-D3D6-447F-B3DE-CE2D8B242E36")
                },
                new Lookup()
                {
                    Id = Guid.Parse("4F584448-9877-4037-AF0D-1AD2B17AD9F1"),
                    Name = "LPA locations",
                    QueryText = "SELECT DISTINCT LOCATION AS LABEL, LOCATION AS VALUE FROM " + Constants.DEFAULT_SCHEMA + ".GFORM_SITE_HIERARCHY_MV WHERE 1=1 {{AND DOT_OPERATOR_NAME = ##DOT_OPERATOR_NAME##}} {{AND DIVISION_NAME = ##DIVISION_NAME##}} {{AND AREA_NAME = ##AREA_NAME##}} ORDER BY LOCATION",
                    DataSourceConnectionId = new Guid("4DEFF6DB-D3D6-447F-B3DE-CE2D8B242E36")
                },
                new Lookup()
                {
                    Id = Guid.Parse("901B664B-B443-45C1-8F49-B585A845E321"),
                    Name = "LPA SiteName",
                    QueryText = "SELECT DISTINCT SITENAME AS LABEL, SITENAME AS VALUE FROM " + Constants.DEFAULT_SCHEMA + ".GFORM_SITE_HIERARCHY_MV WHERE 1=1 {{AND DOT_OPERATOR_NAME = ##DOT_OPERATOR_NAME##}} {{AND DIVISION_NAME = ##DIVISION_NAME##}} {{AND AREA_NAME = ##AREA_NAME##}} {{AND LOCATION = ##LOCATION##}} ORDER BY SITENAME",
                    DataSourceConnectionId = new Guid("4DEFF6DB-D3D6-447F-B3DE-CE2D8B242E36")
                }
            };
            foreach (var item in lpaLookups)
            {
                _depDbContext.Lookups.Add(item);
            }

            var lpaMenus = new List<SiteMenu>(){
                new SiteMenu()
                {
                    Id = new Guid("863C0321-F5BE-4145-B182-9F229DDBD792"),
                    Name = "lpa-site",
                    Label = "LPA Site",
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
                    Name = "site-lpa-s",
                    Label = "Site LPA(s)",
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
                    Name = "remediation-activities",
                    Label = "Remediation Activities",
                    Icon = "pi pi-table",
                    Type = "Sub Portal Item",
                    Link = "",
                    ParentId = new Guid("863C0321-F5BE-4145-B182-9F229DDBD792"),
                    Order = 1,
                    Status = PortalItemStatus.Published
                }
            };
            foreach (var item in lpaMenus)
            {
                var entity = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == item.Id);
                if (entity != null) _depDbContext.SiteMenus.Update(item);
                else _depDbContext.SiteMenus.Add(item);
            }

            var lpaSite = new UniversalGridConfiguration()
            {
                Id = Guid.NewGuid(),
                Name = "lpa-site",
                ConfigCompleted = true,
                DataSourceConnectionId = new Guid("4DEFF6DB-D3D6-447F-B3DE-CE2D8B242E36"),
                ItemType = GridItemType.LINKED,

                DataSourceConfig = JsonSerializer.Serialize(new LinkedDataSourceConfig
                {
                    LinkedTable = new DataSourceConfig()
                    {
                        DataSourceConnectionId = Guid.Parse("4DEFF6DB-D3D6-447F-B3DE-CE2D8B242E36"),
                        TableName = "LPASITE_RELATION",
                        TableSchema = Constants.DEFAULT_SCHEMA,
                        IdColumn = "OBJECTID"
                    },
                    PrimaryTable = new LinkedTableConfig()
                    {
                        Id = new Guid("060B81FF-EBBB-4FA8-BCD5-00568860153F"),
                        ColumnsForLinkedField = new List<string>() { "LPANAME", "TYPE", "LPASTATUS", "DISCOVERYDATE", "REMEDIATIONPROPOSEDDATE", "COMMENTS" },
                        MapToLinkedTableField = "LEFTID"
                    },
                    SecondaryTable = new LinkedTableConfig()
                    {
                        Id = new Guid("9CAB7319-5295-46F0-8879-F58F434C0397"),
                        ColumnsForLinkedField = new List<string>() { "TYPE", "LPAACTIVITYSTATUS", "REMEDIATIONPROPOSEDDATE", "COMMENTS" },
                        MapToLinkedTableField = "RIGHTID"
                    }
                }),

                SearchConfig = JsonSerializer.Serialize(new SearchFieldConfig[] {
                    new SearchFieldConfig {
                        key = "DOT_OPERATOR_NAME",
                        type = "select",
                        filterType = "text",
                        props = new {
                            label = "DOT Operator",
                            placeholder = "Select Operator...",
                            optionsLookup = "140FEA8D-DEA8-4314-8B29-6F1BD140C79A"
                        },
                        searchRule = new SearchFieldFilterRule
                        {
                            field = "DOT_OPERATOR_NAME",
                            matchMode = "equals"
                        },
                        searchRule1 = new SearchFieldFilterRule
                        {
                            field = "DOT_OPERATOR_NAME",
                            matchMode = "equals"
                        }
                    },
                    new SearchFieldConfig {
                        key = "DIVISION_NAME",
                        type = "select",
                        filterType = "text",
                        props = new {
                            label = "Division",
                            placeholder = "Select Division...",
                            optionsLookup = "EF604385-873D-4229-9685-1D14BE1B484C",
                            dependOnFields = new object[]{ "DOT_OPERATOR_NAME" }
                        },
                        searchRule = new SearchFieldFilterRule
                        {
                            field = "DIVISION_NAME",
                            matchMode = "equals"
                        },
                        searchRule1 = new SearchFieldFilterRule
                        {
                            field = "DIVISION_NAME",
                            matchMode = "equals"
                        }
                    },
                    new SearchFieldConfig {
                        key = "AREA_NAME",
                        type = "select",
                        filterType = "text",
                        props = new {
                            label = "Area",
                            placeholder = "Select Area...",
                            optionsLookup = "44A5D080-876C-42B4-8243-739D2BCEA013",
                            dependOnFields = new object[]{ "DOT_OPERATOR_NAME", "DIVISION_NAME" }
                        },
                        searchRule = new SearchFieldFilterRule
                        {
                            field = "AREA_NAME",
                            matchMode = "equals"
                        },
                        searchRule1 = new SearchFieldFilterRule
                        {
                            field = "AREA_NAME",
                            matchMode = "equals"
                        }
                    },
                    new SearchFieldConfig {
                        key = "LOCATION",
                        type = "select",
                        filterType = "text",
                        props = new {
                            label = "Location",
                            placeholder = "Select Location...",
                            optionsLookup = "4F584448-9877-4037-AF0D-1AD2B17AD9F1",
                            dependOnFields = new object[]{ "DOT_OPERATOR_NAME", "DIVISION_NAME", "AREA_NAME" }
                        },
                        searchRule = new SearchFieldFilterRule
                        {
                            field = "LOCATION",
                            matchMode = "equals"
                        },
                        searchRule1 = new SearchFieldFilterRule
                        {
                            field = "LOCATION",
                            matchMode = "equals"
                        }
                    },
                    new SearchFieldConfig {
                        key = "SITENAME",
                        type = "select",
                        filterType = "text",
                        props = new {
                            label = "Site Name",
                            placeholder = "Select Site Name...",
                            optionsLookup = "901B664B-B443-45C1-8F49-B585A845E321",
                            dependOnFields = new object[]{ "DOT_OPERATOR_NAME", "DIVISION_NAME", "AREA_NAME", "LOCATION" }
                        },
                        searchRule = new SearchFieldFilterRule
                        {
                            field = "SITENAME",
                            matchMode = "equals"
                        },
                        searchRule1 = new SearchFieldFilterRule
                        {
                            field = "SITENAME",
                            matchMode = "equals"
                        }
                    }
                })
            };
            _depDbContext.UniversalGridConfigurations.Add(lpaSite);
            var siteLpas = new UniversalGridConfiguration()
            {
                Id = new Guid("D13087B3-F5DD-466D-AAFC-C73582C31473"),
                Name = "site-lpa-s",
                ConfigCompleted = true,
                DataSourceConnectionId = new Guid("4DEFF6DB-D3D6-447F-B3DE-CE2D8B242E36"),
                ItemType = GridItemType.LINKED_SINGLE,

                DataSourceConfig = JsonSerializer.Serialize(new DataSourceConfig
                {
                    DataSourceConnectionId = Guid.Parse("4DEFF6DB-D3D6-447F-B3DE-CE2D8B242E36"),
                    QueryText = "SELECT * FROM DATA_EDITOR_PORTAL.LPASITE l \nLEFT JOIN DATA_EDITOR_PORTAL.GFORM_SITE_HIERARCHY_MV gshm ON l.BOUNDARYGLOBALID = gshm.HIERARCHY_GLOBALID \nWHERE ##WHERE## AND ##SEARCHES## AND ##FILTERS## ORDER BY ##ORDERBY##",
                    IdColumn = "OBJECTID",
                    SortBy = new List<SortParam>() { new SortParam { field = "LPANAME", order = 1 } }
                }),

                ColumnsConfig = JsonSerializer.Serialize(new GridColConfig[] {
                    new GridColConfig { type = "DataBaseField", field = "LOCATION", header = "Location", width = "250px", filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "SITENAME", header = "Site Name", width = "250px", filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "LPANAME", header = "LPA Name", width = "250px", filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "TYPE", header = "LPA Type", width = "250px", filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "LPASTATUS", header = "LPA Status", width = "250px", filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "DISCOVERYDATE", header = "Discovery Date", width = "250px", filterType = "date", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "D40CRITERIA", header = "D40 Criteria", width = "250px", filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "ASSESSEDBY", header = "Assesed By", width = "250px", filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "REQREMEDIATIONDATE", header = "Required Remed. Date", width = "250px", filterType = "date", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "REMEDIATIONPROPOSEDDATE", header = "Remed. Proposed Date", width = "250px", filterType = "date", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "REMEDIATIONACTUALDATE", header = "Remed. Actual Date", width = "250px", filterType = "date", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "COMMENTS", header = "Comments", width = "250px", filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "STATUS", header = "Status", width = "250px", filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "CREATIONUSER", header = "Creation User", width = "250px", filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "LASTUSER", header = "Last User", width = "250px", filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "DATEMODIFIED", header = "Date Modified", width = "250px", filterType = "date", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "DATECREATED", header = "Date Created", width = "250px", filterType = "date", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "GLOBALID", header = "GLOBALID", width = "250px", filterType = "text", sortable = true }
                }),

                SearchConfig = JsonSerializer.Serialize(new SearchFieldConfig[] {
                    new SearchFieldConfig {
                        key = "DOT_OPERATOR_NAME",
                        type = "select",
                        filterType = "text",
                        props = new {
                            label = "DOT Operator",
                            placeholder = "Select Operator..."
                        },
                        searchRule = new SearchFieldFilterRule
                        {
                            field = "DOT_OPERATOR_NAME",
                            matchMode = "equals"
                        }
                    },
                    new SearchFieldConfig {
                        key = "DIVISION_NAME",
                        type = "select",
                        filterType = "text",
                        props = new {
                            label = "Division",
                            placeholder = "Select Division..."
                        },
                        searchRule = new SearchFieldFilterRule
                        {
                            field = "DIVISION_NAME",
                            matchMode = "equals"
                        }
                    },
                    //new SearchFieldConfig {
                    //    key = "ROLES",
                    //    type = "multiSelect",
                    //    filterType = "text",
                    //    props = new {
                    //        label = "Roles",
                    //        placeholder = "Please select",
                    //        optionsLookup = "727052BA-0033-42C9-A39C-06A103E4B021"
                    //    },
                    //    searchRule = new SearchFieldFilterRule
                    //    {
                    //        field = "ROLES",
                    //        whereClause = $"ID IN (SELECT USER_ID FROM {Constants.DEFAULT_SCHEMA}.USER_PERMISSIONS WHERE PERMISSION_GRANT_ID IN ##VALUE##)"
                    //    }
                    //},
                    new SearchFieldConfig {
                        key = "AREA_NAME",
                        type = "select",
                        filterType = "text",
                        props = new {
                            label = "Area",
                            placeholder = "Select Area..."
                        },
                        searchRule = new SearchFieldFilterRule
                        {
                            field = "AREA_NAME",
                            matchMode = "equals"
                        }
                    },
                    new SearchFieldConfig {
                        key = "LOCATION",
                        type = "select",
                        filterType = "text",
                        props = new {
                            label = "Location",
                            placeholder = "Select Location..."
                        },
                        searchRule = new SearchFieldFilterRule
                        {
                            field = "LOCATION",
                            matchMode = "equals"
                        }
                    },
                    new SearchFieldConfig {
                        key = "SITENAME",
                        type = "select",
                        filterType = "text",
                        props = new {
                            label = "Site Name",
                            placeholder = "Select Site Name..."
                        },
                        searchRule = new SearchFieldFilterRule
                        {
                            field = "SITENAME",
                            matchMode = "equals"
                        }
                    }
                }),

                DetailConfig = JsonSerializer.Serialize(new DetailConfig
                {
                    AddingForm = new GridFormLayout
                    {
                        FormFields = new List<FormFieldConfig>() {
                            new FormFieldConfig()
                            {
                                filterType = "text",
                                key = "LPANAME",
                                type = "input",
                                props = new
                                {
                                    label = "LPA Name"
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "text",
                                key = "TYPE",
                                type = "select",
                                props = new
                                {
                                    label = "LPA Type",
                                    optionsLookup = new object[]
                                    {
                                        new { label = "< .850mV Off Criteria", value = "< .850mV Off Criteria" },
                                        new { label = "< .850mV Off Criteria and < 100mV Shift Criteria", value = "< .850mV Off Criteria and < 100mV Shift Criteria" },
                                        new { label = "< 100mV Shift Criteria", value = "< 100mV Shift Criteria" }
                                    }
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "text",
                                key = "LPASTATUS",
                                type = "select",
                                props = new
                                {
                                    label = "LPA Status",
                                    optionsLookup = new object[]
                                    {
                                        new { label = "Not Remediated", value = "Not Remediated" },
                                        new { label = "Remediated", value = "Remediated" }
                                    }
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "date",
                                key = "DISCOVERYDATE",
                                type = "datepicker",
                                props = new
                                {
                                    label = "Discovery Date"
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "text",
                                key = "D40CRITERIA",
                                type = "select",
                                props = new
                                {
                                    label = "D40 Criteria",
                                    optionsLookup = new object[]
                                    {
                                        new { label = "D.40 Criteria 1 (6 Months)", value = "D.40 Criteria 1 (6 Months)" },
                                        new { label = "D.40 Criteria 2 (12 Months not to exceed 15 Months)", value = "D.40 Criteria 2 (12 Months not to exceed 15 Months)" }
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
                                    label = "Assesed By",
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
                                key = "REQREMEDIATIONDATE",
                                type = "datepicker",
                                props = new
                                {
                                    label = "Required Remed. Date"
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "date",
                                key = "REMEDIATIONPROPOSEDDATE",
                                type = "datepicker",
                                props = new
                                {
                                    label = "Remed. Proposed Date"
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "date",
                                key = "REMEDIATIONACTUALDATE",
                                type = "datepicker",
                                props = new
                                {
                                    label = "Remed. Actual Date"
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "text",
                                key = "COMMENTS",
                                type = "textarea",
                                props = new
                                {
                                    label = "Comments"
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "linkDataField",
                                key = "LINK_DATA_FIELD",
                                type = "linkDataEditor",
                                props = new
                                {
                                    label = "Remediation Activies"
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
                                    queryText = "SELECT gshm.HIERARCHY_GLOBALID FROM DATA_EDITOR_PORTAL.GFORM_SITE_HIERARCHY_MV gshm WHERE rownum = 1"
                                }
                            },
                        },
                        QueryText =
                            IsOracle()
                            ? "INSERT INTO DATA_EDITOR_PORTAL.LPASITE \n(LPANAME,\u0022TYPE\u0022,LPASTATUS,DISCOVERYDATE,D40CRITERIA,ASSESSEDBY,REQREMEDIATIONDATE,REMEDIATIONPROPOSEDDATE,REMEDIATIONACTUALDATE,COMMENTS,DATECREATED,BOUNDARYGLOBALID) \nVALUES (##LPANAME##,##TYPE##,##LPASTATUS##,##DISCOVERYDATE##,##D40CRITERIA##,##ASSESSEDBY##,##REQREMEDIATIONDATE##,##REMEDIATIONPROPOSEDDATE##,##REMEDIATIONACTUALDATE##,##COMMENTS##,##DATECREATED##,##BOUNDARYGLOBALID##)\nRETURNING OBJECTID INTO ##RETURNED_OBJECTID##"
                            : IsSqlConnection()
                            ? "DECLARE @InsertedIDResults TABLE (ID NVARCHAR(40)); \nINSERT INTO DATA_EDITOR_PORTAL.LPASITE (LPANAME,\u0022TYPE\u0022,LPASTATUS,DISCOVERYDATE,D40CRITERIA,ASSESSEDBY,REQREMEDIATIONDATE,REMEDIATIONPROPOSEDDATE,REMEDIATIONACTUALDATE,COMMENTS,DATECREATED,BOUNDARYGLOBALID) \nOUTPUT INSERTED.OBJECTID INTO @InsertedIDResults \nVALUES (##LPANAME##,##TYPE##,##LPASTATUS##,##DISCOVERYDATE##,##D40CRITERIA##,##ASSESSEDBY##,##REQREMEDIATIONDATE##,##REMEDIATIONPROPOSEDDATE##,##REMEDIATIONACTUALDATE##,##COMMENTS##,##DATECREATED##,##BOUNDARYGLOBALID##);\nSET ##RETURNED_OBJECTID## = (SELECT TOP 1 ID FROM @InsertedIDResults);"
                            : ""
                    },
                    UpdatingForm = new GridFormLayout
                    {
                        UseAddingFormLayout = true,
                        QueryText = "UPDATE DATA_EDITOR_PORTAL.LPASITE SET LPANAME=##LPANAME##,\u0022TYPE\u0022=##TYPE##,LPASTATUS=##LPASTATUS##,DISCOVERYDATE=##DISCOVERYDATE##,D40CRITERIA=##D40CRITERIA##,ASSESSEDBY=##ASSESSEDBY##,REQREMEDIATIONDATE=##REQREMEDIATIONDATE##,REMEDIATIONPROPOSEDDATE=##REMEDIATIONPROPOSEDDATE##,REMEDIATIONACTUALDATE=##REMEDIATIONACTUALDATE##,COMMENTS=##COMMENTS##,DATEMODIFIED=##DATEMODIFIED## WHERE OBJECTID=##OBJECTID##"
                    },
                    DeletingForm = new GridFormLayout
                    {
                        UseAddingFormLayout = true,
                        QueryText = "DELETE FROM DATA_EDITOR_PORTAL.LPASITE WHERE OBJECTID IN ##OBJECTID##"
                    }
                }),
            };
            _depDbContext.UniversalGridConfigurations.Add(siteLpas);
            var remediationActivities = new UniversalGridConfiguration()
            {
                Id = new Guid("8797B3BB-E6C5-4E54-83C2-88D78E8AAA05"),
                Name = "remediation-activities",
                ConfigCompleted = true,
                DataSourceConnectionId = new Guid("4DEFF6DB-D3D6-447F-B3DE-CE2D8B242E36"),
                ItemType = GridItemType.LINKED_SINGLE,

                DataSourceConfig = JsonSerializer.Serialize(new DataSourceConfig
                {
                    DataSourceConnectionId = Guid.Parse("4DEFF6DB-D3D6-447F-B3DE-CE2D8B242E36"),
                    QueryText = "SELECT * FROM DATA_EDITOR_PORTAL.LPAREMEDIATIONACTSITE l \nLEFT JOIN DATA_EDITOR_PORTAL.GFORM_SITE_HIERARCHY_MV gshm ON l.BOUNDARYGLOBALID = gshm.HIERARCHY_GLOBALID \nWHERE ##WHERE## AND ##SEARCHES## AND ##FILTERS## ORDER BY ##ORDERBY##",
                    IdColumn = "OBJECTID",
                    PageSize = 100,
                    SortBy = new List<SortParam>() { new SortParam { field = "SITENAME", order = 1 } }
                }),

                ColumnsConfig = JsonSerializer.Serialize(new GridColConfig[] {
                    new GridColConfig { type = "DataBaseField", field = "LOCATION", header = "Location", width = "250px", filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "SITENAME", header = "Site Name", width = "250px", filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "TYPE", header = "Activity Type", width = "250px", filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "LPAACTIVITYSTATUS", header = "Activity Status", width = "250px", filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "ASSIGNEDTO", header = "Assigned To", width = "250px", filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "REMEDIATIONPROPOSEDDATE", header = "Remed. Proposed Date", width = "250px", filterType = "date", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "REMEDIATIONACTUALDATE", header = "Remed. Actual Date", width = "250px", filterType = "date", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "COMMENTS", header = "Comments", width = "250px", filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "STATUS", header = "Status", width = "250px", filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "CREATIONUSER", header = "Creation User", width = "250px", filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "LASTUSER", header = "Last User", width = "250px", filterType = "text", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "DATEMODIFIED", header = "Date Modified", width = "250px", filterType = "date", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "DATECREATED", header = "Date Created", width = "250px", filterType = "date", sortable = true },
                    new GridColConfig { type = "DataBaseField", field = "GLOBALID", header = "GLOBALID", width = "250px", filterType = "text", sortable = true }
                }),

                SearchConfig = JsonSerializer.Serialize(new SearchFieldConfig[] {
                    new SearchFieldConfig {
                        key = "DOT_OPERATOR_NAME",
                        type = "select",
                        filterType = "text",
                        props = new {
                            label = "DOT Operator",
                            placeholder = "Select Operator..."
                        },
                        searchRule = new SearchFieldFilterRule
                        {
                            field = "DOT_OPERATOR_NAME",
                            matchMode = "equals"
                        }
                    },
                    new SearchFieldConfig {
                        key = "DIVISION_NAME",
                        type = "select",
                        filterType = "text",
                        props = new {
                            label = "Division",
                            placeholder = "Select Division..."
                        },
                        searchRule = new SearchFieldFilterRule
                        {
                            field = "DIVISION_NAME",
                            matchMode = "equals"
                        }
                    },
                    new SearchFieldConfig {
                        key = "AREA_NAME",
                        type = "select",
                        filterType = "text",
                        props = new {
                            label = "Area",
                            placeholder = "Select Area..."
                        },
                        searchRule = new SearchFieldFilterRule
                        {
                            field = "AREA_NAME",
                            matchMode = "equals"
                        }
                    },
                    new SearchFieldConfig {
                        key = "LOCATION",
                        type = "select",
                        filterType = "text",
                        props = new {
                            label = "Location",
                            placeholder = "Select Location..."
                        },
                        searchRule = new SearchFieldFilterRule
                        {
                            field = "LOCATION",
                            matchMode = "equals"
                        }
                    },
                    new SearchFieldConfig {
                        key = "SITENAME",
                        type = "select",
                        filterType = "text",
                        props = new {
                            label = "Site Name",
                            placeholder = "Select Site Name..."
                        },
                        searchRule = new SearchFieldFilterRule
                        {
                            field = "SITENAME",
                            matchMode = "equals"
                        }
                    }
                }),

                DetailConfig = JsonSerializer.Serialize(new DetailConfig
                {
                    AddingForm = new GridFormLayout
                    {
                        FormFields = new List<FormFieldConfig>() {
                            new FormFieldConfig()
                            {
                                filterType = "text",
                                key = "TYPE",
                                type = "select",
                                props = new
                                {
                                    label = "Activity Type",
                                    optionsLookup = new object[]
                                    {
                                        new { label = "Armor Plate", value = "Armor Plate" },
                                        new { label = "Clock Spring", value = "Clock Spring" },
                                        new { label = "Force Screw Type Leak Clamp", value = "Force Screw Type Leak Clamp" },
                                        new { label = "Grinding", value = "Grinding" },
                                        new { label = "Manufactured Repair Sleeve", value = "Manufactured Repair Sleeve" }
                                    }
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "text",
                                key = "LPAACTIVITYSTATUS",
                                type = "select",
                                props = new
                                {
                                    label = "Activity Status",
                                    optionsLookup = new object[]
                                    {
                                        new { label = "Not Remediated", value = "Not Remediated" },
                                        new { label = "Remediated", value = "Remediated" }
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
                                    label = "Assigned To",
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
                                key = "REMEDIATIONPROPOSEDDATE",
                                type = "datepicker",
                                props = new
                                {
                                    label = "Remed. Proposed Date"
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "date",
                                key = "REMEDIATIONACTUALDATE",
                                type = "datepicker",
                                props = new
                                {
                                    label = "Remed. Actual Date"
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "text",
                                key = "COMMENTS",
                                type = "textarea",
                                props = new
                                {
                                    label = "Comments"
                                }
                            },
                            new FormFieldConfig()
                            {
                                filterType = "linkDataField",
                                key = "LINK_DATA_FIELD",
                                type = "linkDataEditor",
                                props = new
                                {
                                    label = "Remediation Activies"
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
                                    queryText = "SELECT gshm.HIERARCHY_GLOBALID FROM DATA_EDITOR_PORTAL.GFORM_SITE_HIERARCHY_MV gshm WHERE rownum = 1"
                                }
                            },
                        },
                        QueryText =
                            IsOracle()
                            ? "INSERT INTO DATA_EDITOR_PORTAL.LPAREMEDIATIONACTSITE (\u0022TYPE\u0022,LPAACTIVITYSTATUS,ASSIGNEDTO,REMEDIATIONPROPOSEDDATE,REMEDIATIONACTUALDATE,COMMENTS,DATECREATED,BOUNDARYGLOBALID) \nVALUES (##TYPE##,##LPAACTIVITYSTATUS##,##ASSIGNEDTO##,##REMEDIATIONPROPOSEDDATE##,##REMEDIATIONACTUALDATE##,##COMMENTS##,##DATECREATED##,##BOUNDARYGLOBALID##)\nRETURNING OBJECTID INTO ##RETURNED_OBJECTID##"
                            : IsSqlConnection()
                            ? "DECLARE @InsertedIDResults TABLE (ID NVARCHAR(40)); \nINSERT INTO DATA_EDITOR_PORTAL.LPAREMEDIATIONACTSITE (\u0022TYPE\u0022,LPAACTIVITYSTATUS,ASSIGNEDTO,REMEDIATIONPROPOSEDDATE,REMEDIATIONACTUALDATE,COMMENTS,DATECREATED,BOUNDARYGLOBALID) \nOUTPUT INSERTED.OBJECTID INTO @InsertedIDResults \nVALUES (##TYPE##,##LPAACTIVITYSTATUS##,##ASSIGNEDTO##,##REMEDIATIONPROPOSEDDATE##,##REMEDIATIONACTUALDATE##,##COMMENTS##,##DATECREATED##,##BOUNDARYGLOBALID##);\nSET ##RETURNED_OBJECTID## = (SELECT TOP 1 ID FROM @InsertedIDResults);"
                            : ""
                    },
                    UpdatingForm = new GridFormLayout
                    {
                        UseAddingFormLayout = true,
                        QueryText = "UPDATE DATA_EDITOR_PORTAL.LPAREMEDIATIONACTSITE SET \u0022TYPE\u0022=##TYPE##,LPAACTIVITYSTATUS=##LPAACTIVITYSTATUS##,ASSIGNEDTO=##ASSIGNEDTO##,REMEDIATIONPROPOSEDDATE=##REMEDIATIONPROPOSEDDATE##,REMEDIATIONACTUALDATE=##REMEDIATIONACTUALDATE##,COMMENTS=##COMMENTS##,DATEMODIFIED=##DATEMODIFIED## WHERE OBJECTID = ##OBJECTID##"
                    },
                    DeletingForm = new GridFormLayout
                    {
                        UseAddingFormLayout = true,
                        QueryText = "DELETE FROM DATA_EDITOR_PORTAL.LPAREMEDIATIONACTSITE WHERE OBJECTID IN ##OBJECTID##"
                    }
                })
            };
            _depDbContext.UniversalGridConfigurations.Add(remediationActivities);

            var lpaPermissions = new List<SitePermission>() {
                new SitePermission()
                {
                    Id = Guid.NewGuid(),
                    Category = $"Portal Item: Site LPA(s)",
                    PermissionName = $"VIEW_SITE_LPA_S".ToUpper(),
                    PermissionDescription = $"View Site LPA(s)"
                },
                new SitePermission()
                {
                    Id = Guid.NewGuid(),
                    Category = $"Portal Item: Site LPA(s)",
                    PermissionName = $"ADD_SITE_LPA_S".ToUpper(),
                    PermissionDescription = $"Add Site LPA(s)"
                },
                new SitePermission()
                {
                    Id = Guid.NewGuid(),
                    Category = $"Portal Item: Site LPA(s)",
                    PermissionName = $"EDIT_SITE_LPA_S".ToUpper(),
                    PermissionDescription = $"Edit Site LPA(s)"
                },
                new SitePermission()
                {
                    Id = Guid.NewGuid(),
                    Category = $"Portal Item: Site LPA(s)",
                    PermissionName = $"DELETE_SITE_LPA_S".ToUpper(),
                    PermissionDescription = $"Delete Site LPA(s)"
                },
                new SitePermission()
                {
                    Id = Guid.NewGuid(),
                    Category = $"Portal Item: Site LPA(s))",
                    PermissionName = $"EXPORT_SITE_LPA_S".ToUpper(),
                    PermissionDescription = $"Export Site LPA(s)"
                },
                new SitePermission()
                {
                    Id = Guid.NewGuid(),
                    Category = $"Portal Item: Remediation Activities",
                    PermissionName = $"VIEW_REMEDIATION_ACTIVITIES".ToUpper(),
                    PermissionDescription = $"View Remediation Activities"
                },
                new SitePermission()
                {
                    Id = Guid.NewGuid(),
                    Category = $"Portal Item: Remediation Activities",
                    PermissionName = $"ADD_REMEDIATION_ACTIVITIES".ToUpper(),
                    PermissionDescription = $"Add Remediation Activities"
                },
                new SitePermission()
                {
                    Id = Guid.NewGuid(),
                    Category = $"Portal Item: Remediation Activities",
                    PermissionName = $"EDIT_REMEDIATION_ACTIVITIES".ToUpper(),
                    PermissionDescription = $"Edit Remediation Activities"
                },
                new SitePermission()
                {
                    Id = Guid.NewGuid(),
                    Category = $"Portal Item: Remediation Activities",
                    PermissionName = $"DELETE_REMEDIATION_ACTIVITIES".ToUpper(),
                    PermissionDescription = $"Delete Remediation Activities"
                },
                new SitePermission()
                {
                    Id = Guid.NewGuid(),
                    Category = $"Portal Item: Remediation Activities",
                    PermissionName = $"EXPORT_REMEDIATION_ACTIVITIES".ToUpper(),
                    PermissionDescription = $"Export Remediation Activities"
                }
            };
            foreach (var item in lpaPermissions)
            {
                _depDbContext.SitePermissions.Add(item);
            }

            var operators = new string[] { "Sunoco Pipeline L.P.", "Transwestern Pipeline Company LLC" };
            var divisions = new string[] { "West District", "Western" };
            var areas = new string[] { "03 - Abilene", "Great Plains District", "01 - Sour Lake", "09 - Dakotas", "02 - Corsicana", "06 - Longview", "01 - Sour Lake Gathering", "TW West Area", "Roswell", "Midwest" };
            var location = new string[] { "Abilene", "SOK", "NOK", "Sour Lake", "Aldine", "Drumright", "North Dakota South", "Hebert", "Corsicana", "Longview", "3SW", "2NE", "North Dakota North", "Gallup", "Flagstaff", "Laguna", "Roswell", "Kingman", "Phoenix", "Carlsbad", "Dawn", "San Juan", "Pampa", "Artesia", "Cambridge", "Dakotas", "Hebron", "4SE" };
            var siteType = new string[] { "Pump Station", "Valve Setting", "Launcher/Receiver", "Junction", "Plant", "Processing Plant", "Other", "Marketing Terminal", "Truck Station", "M&R Station", "Pigging Facility", "Compressor Station", "Group Site", "Receiver Site", "Field Unit (Single Unit Pump)", "Station", "Launcher Site", "Interconnect", "Engine Fuel Gas", "Unknown", "Lateral Take-Off", "Tank Farm" };
            var siteName = new string[] { "Rule Truck Station (-99.87152761, 33.22102027)", "Rule Truck Station", "Rush Creek LACT (-97.72912951, 34.68889105)", "Rush Creek LACT", "S 49th W Ave Gate Setting Boundry", "S China  (-94.33797048, 30.00538642)", "S China ", "S China", "S. Hardy/Hill Rd. Valve Setting", "S. Headgate Valve (Magnolia Station) V-1112", "S. Headgate Valve(Magnolia Station) V-1111", "S. Neches River MLV Valve Setting (-94.92103858, 31.36444076)", "S. Neches River MLV Valve Setting (-94.92382148, 31.33029324)", "S. Smith Rd Valve setting", "S. Trinity River MLV Valve Setting (-94.96794146, 30.57319118)", "S42ndST Valve Setting", "Sacroc Tract 36", "Safety Kleen Truck Station (-95.73128063, 36.23705756)", "Safety Kleen Truck Station", "Salt Flats MP 189.6  - MLV-21021-60.75 Valve Setting", "San Angelo Rail (-100.4104203, 31.49921144)", "San Angelo Rail", "Sapulpa Jct.", "Saratoga  (-94.5059255, 30.28661878)", "Saratoga Jct.", "Saratoga ", "Saunders Rd. Valve Setting", "Savannah Road (-93.96354614, 29.90043656)", "Savannah Road", "Sayre Rail (-99.6502107, 35.29062869)", "Sayre Rail", "Schenk Battery #2 ", "Schenk Battery #3", "Searight LACT (-96.62675569, 35.25386760)", "Searight LACT", "Seattle Terminal (-122.3534454, 47.58180814)", "Seattle Terminal (-122.3566566, 47.58173825)", "Seattle Terminal Maysville", "Seattle Terminal North Dakota South", "Selma Terminal - 1", "Selma Terminal - 3 (-78.30699972, 35.55375652)", "Seminole 2 Truck Station (-96.64108426, 35.24695949)", "Seminole 2 Truck Station", "Seminole ", "Shawnee (-97.44606514, 35.46553618)", "Shawnee (-97.44763949, 35.46624107)", "Shawnee", "Sheldon Rd. OTI Meter Site KL-1 Valve Site", "Sheldon Rd. OTI Meter Site KL-2 Valve Site", "Sheldon Road OTI Meter Skid", "Shell Rd (Nolte Rd 16 MLV)", "Sheppard - MLV Valve Setting(-94.98112500, 30.46817637)", "Shiro(-95.86563250, 30.65980410)", "Shiro ", "Slick Jct. (-96.23776373, 35.80712830)", "Slick Jct.", "Smith Truck Station(-94.91007921, 32.38994372)", "Smith Truck Station", "Snyder Booster Launcher / Receiver Site", "Snyder Midpoint(-98.8518905, 34.60940905)", "Snyder Midpoint", "Snyder Truck Station(-100.9656626, 32.69717154)", "Snyder Truck Station", "Sohio Facility(-97.43786162, 34.56319116)", "Sohio Facility", "Schenk Battery #4", "Schenk Gathering (-98.02083801, 35.03766299)", "Schenk Gathering", "SE of Alligator Bayou Valve Setting", "Seabreeze  (-94.40177187, 29.78794332)", "Seabreeze B Truck Station SXL", "Seabreeze B Truck Station", "Seabreeze C Truck Station", "Seabreeze ", "San Antonio Terminal (-98.43466523, 29.44146294)", "San Antonio Terminal", "San Augustine (-94.10132593, 31.57712817)", "San Augustine", "San Jacinto East Valve Setting", "San Jacinto River - MLV Valve Setting (-95.10931699, 29.88776322)", "San Jacinto River National Forest Valve site", "San Jacinto West Valve Setting ", "Sand Creek (-98.03832243, 36.83575600)", "Sand Creek", "Sandstone Granite C/P", "Sapulpa Jct. (-96.04766963, 36.01723718)", "Port Arthur Terminal #1 Jct. (-94.00972269, 29.91212852)", "Port Arthur Terminal #1 Jct.", "Port Arthur Total Station ", "Portland Terminal - 1 (-122.7774607, 45.59157274)", "Portland Terminal - 2", "Portland Terminal - 3", "Post Truck Station (-101.372781, 33.15224423)", "Post Truck Station", "Price East West Check", "Pride-PRID", "Prover", "Pump Station LSX4 (-97.57276673, 32.06611543)", "Purdy Trap Jct. (-97.4397243, 34.75033938)", "Purdy Trap Jct.", "PWI/Collingsworth St. Trap Site ", "Ramsey (-97.12110296, 36.02983381)", "Ranch Road 2171 Gate Setting Boundary", "Ranger (COMY-SBEN) (-98.71409252, 32.43783134)", "Ranger Truck Station (-98.71344078, 32.43822922)", "Ranger Truck Station", "Receiver Valve Gate Setting Boundary", "Reed-Trust, Pump #28", "Reinecke Truck Station (-101.2558087, 32.56993421)", "Reinecke Truck Station", "Rhodes Station (-97.96163019, 36.40905489)", "Rhodes Station", "Rich (-96.93385577, 35.02768254)", "Rich Jct. (-96.90932921, 35.03081980)", "Rich Jct.", "Rich", "Richey Truck Station (-104.9039521, 47.60236310)", "Richey Truck Station", "Ridge Rt. Rd - MLV-21010-97.87 Valve Setting", "Rieber  (-94.92805079, 32.02415356)", "Rieber ", "Ringgold Pump North (NuStar Logistics) (-97.95384813, 33.86762844)", "Ringgold Pump Station-RING", "Ringgold Pump Station", "Ringwood (-98.28086444, 36.32365566)", "Ringwood (-98.28299829, 36.32149268)", "Ringwood", "Roaring Springs Truck Station (-104.5652567, 32.28623109)", "Roaring Springs Truck Station", "Robert Lee Truck Station (-100.4533011, 31.90714815)", "Robert Lee Truck Station", "Row Intersection Valve Setting", "Rowe 1", "Rowena (-100.0234102, 31.66787690)", "Rowena", "Gate Setting 4009L", "Gate Setting 4010", "Gate Setting 4010L", "Gate Setting 4011", "Gate Setting 4011L", "Gate Setting 4012", "Gate Setting 4012L", "Gate Setting 5007", "Gate Setting 5007L", "Gate Setting 5008", "Gate Setting 5008A", "Gate Setting 5008AL", "Gate Setting 5008L", "Gate Setting 5009", "Gate Setting 5009L", "Gate Setting 5010", "Gate Setting 5010L", "Gate Setting 5011", "Gate Setting 5011/5011L", "Gate Setting 5011L", "Gate Setting 6007", "Gate Setting 6008", "Gate Setting 6008L", "Gate Setting 6009", "Gate Setting 6010", "Gate Setting 7008", "Gate Setting 7008L", "Gate Setting 7009", "Gate Setting 7009L", "Gate Setting 7013", "Gate Setting 7013L", "Gate Setting 7014", "Gate Setting 8008", "Gate Setting 8008 (-105.5641080, 34.03697362)", "Gate Setting 8008L", "Gate Setting 8009", "Gate Setting 8009 (-105.7680740, 34.13002361)", "Gate Setting 8009L", "Gate Setting 8010", "Gate Setting 9007", "Gate Setting 9008", "Gate Setting 9008 (-104.7793792, 33.64481820)", "Gate Setting 9008L", "Gate Setting 9009", "Gate Setting L1008A", "Gate Setting LV-NMMM187", "Gate Setting M-0429", "Gate Setting MK-1", "Gate Setting MLV 104", "Gate Setting MLV 115", "Gate Setting MLV 133", "Gate Setting MLV 147", "Gate Setting MLV 152", "Gate Setting MLV 17", "Gate Setting MLV 213", "Gate Setting MLV 221", "Gate Setting MLV 232", "Gate Setting MLV 239", "Gate Setting MLV 245", "Gate Setting MLV 35", "Gate Setting MLV 42", "Gate Setting MLV 49", "Gate Setting MLV 56", "Gate Setting MLV 62", "Gate Setting MLV 69", "Gate Setting MLV 82", "Gate Setting MLV 87", "Gate Setting MLV-193", "Gate Setting P-312 @ C\\S P-2", "Gate Setting RV 6010", "Gate Setting RV-NMMM187", "Gate Setting S107L", "Gate Setting S108", "Gate Setting S108L", "Gate Setting S109", "Gate Setting S110", "Gate Setting S110L", "Gate Setting S111", "Gate Setting S111L", "Gate Setting S112", "Gate Setting S112L", "Gate Setting S113", "Gate Setting S113L", "Gate Setting_MK-1", "GIANT REFINERY I/C", "GILA BEND LAUNCHER @ M.P. 180", "GILA BEND LAUNCHER AND RECEIVER SETTING", "GILA BEND METER STATION", "GILA BEND RECEIVER @ M.P. 180", "Golden Shores Gas Filtering", "Gore3", "Grand Avenue Meter Station", "Griffith Energy Ic/Cit  Util", "Group Gate Setting 1008/1008L", "Group Gate Setting 1008A/L1008A", "Group Gate Setting 1009/1009L", "CANADIAN RIVER C/S - INTER", "CANADIAN RIVER C/S - INTER (-100.4154286, 35.94388796)", "Carlsbad Pump Station", "Carlsbad Pump Station (-103.8750640, 32.62371103)", "CATOR-BUNDY DEL", "Citizens Util-Kingman", "Clovis SWC M&R", "Cms/Tw Hansford Chk Mtr", "Coolidge Meter Site", "Coolidge Meter Site Receiver Gate Setting", "Crawford Lat Comp", "CRAWFORD LATERAL C/S", "CRAWFORD LATERAL C/S (-104.1479997, 32.26306042)", "Dalhart Compressor Meter Run Piping", "Dalhart Compressor Station", "Dalhart Compressor Station (-101.977353, 36.097788)", "DCP Fuel Delivery", "Desert Basin Lateral Launcher", "Detail Pipe", "Detail Pipe - 10 MCLEAN LAT", "DIAMOND A 35 ST #1 PRODUCER (SOLD)", "DSBO-MLV 5010L - NMMM154", "Duke Crawford Station", "DUKE INTERCONNECT", "DUKE ZIA PLANT", "EAST VALLEY METER STATION", "El Paso Blanco/Tw Check (-107.9516433, 36.73097548)", "El Paso Blanco/Tw Check (-107.9522220, 36.73035348)", "El Paso Interconnect", "Elm Ridge Chaco-Ic", "Enbridge Interconnect", "ENERGAS DEL-GRAY", "Enterprise Chaco Intercon", "EOG Rattlesnake Field Services Interconnect M&R", "EOG Red Hills Fuel IC", "Epng/Tw Eddy Rec", "ETC Rattlesnake Red Hills CS Interconnect M&R", "FELMONT ATOKA COMM #1 M&R (SOLD)", "Frontier Coyote M&R Station", "Frontier Coyote TAKE-OFF ", "Frontier Maljamar Plant", "GALLUP COMPRESSOR STATION", "Gallup Fuel Station Run 1", "Gate Bypass - GAS CO. OF NEW MEXICO FORT WINGATE", "Gate Set L6007", "Gate Setting - AZMM143 - ML STA 4 TO STA 3", "Gate Setting 1008", "Gate Setting 1008A", "Gate Setting 1008L", "Gate Setting 1009", "Gate Setting 1009L", "Gate Setting 1010", "Gate Setting 1010L", "Gate Setting 1011", "Gate Setting 1011L", "Gate Setting 111-1", "Gate Setting 2004", "Gate Setting 2004L", "Gate Setting 2008", "Gate Setting 2008L", "Gate Setting 2009", "Gate Setting 2009L", "Gate Setting 2010", "Gate Setting 2010L", "Gate Setting 2011", "Gate Setting 2011L", "Gate Setting 2012", "Gate Setting 2012L", "Gate Setting 2013 Site", "Gate Setting 2013L (-113.3635357, 35.19695683)", "Gate Setting 3004", "Gate Setting 3004L", "Gate Setting 3008", "Gate Setting 3008L", "Gate Setting 3009", "Gate Setting 3009L", "Gate Setting 3010", "Gate Setting 3010L", "Gate Setting 4008", "Gate Setting 4008L", "Gate Setting 4009", "Sunoco 22012 Valve Setting (Receiver)", "SW 4001 Pump (-102.6362281, 32.12157515)", "SW 4001 Pump", "Sweetwater (-100.4383462, 32.43793023)", "Sweetwater Pump Station", "SXL Migration - Vessel: Storage Tank (-100.30994, 31.82141864)", "SXL Migration - Vessel: Storage Tank (-94.41790005, 30.14573450)", "SXL Migration - Vessel: Storage Tank (-94.41919842, 30.14527252)", "SXL Migration - Vessel: Storage Tank (-94.84753964, 32.50187559)", "SXL Migration - Vessel: Storage Tank (-94.84882440, 32.50201634)", "SXL Migration - Vessel: Storage Tank (-94.85044212, 32.50223887)", "SXL Migration - Vessel: Storage Tank (-94.85139115, 32.50231036)", "SXL Migration - Vessel: Storage Tank (-94.85588133, 30.03398928)", "SXL Migration - Vessel: Storage Tank (-94.90492973, 32.43747655)", "SXL Migration - Vessel: Storage Tank (-94.92348307, 32.17461353)", "SXL Migration - Vessel: Storage Tank (-95.032589, 32.37856505)", "SXL Migration - Vessel: Storage Tank (-95.11087769, 30.39513152)", "SXL Migration - Vessel: Storage Tank (-95.8639999, 30.65980616)", "SXL Migration - Vessel: Storage Tank (-96.02108461, 36.12298425)", "SXL Migration - Vessel: Storage Tank (-96.04767261, 36.07509276)", "SXL Migration - Vessel: Storage Tank (-96.08525786, 35.81369461)", "SXL Migration - Vessel: Storage Tank (-96.41310516, 31.84569142)", "SXL Migration - Vessel: Storage Tank (-96.42479180, 34.87930549)", "SXL Migration - Vessel: Storage Tank (-96.43015433, 35.34520065)", "SXL Migration - Vessel: Storage Tank (-96.45428419, 31.98639195)", "SXL Migration - Vessel: Storage Tank (-96.47494801, 34.87499619)", "SXL Migration - Vessel: Storage Tank (-96.59627950, 35.25926486)", "SXL Migration - Vessel: Storage Tank (-96.73449351, 30.96134251)", "SXL Migration - Vessel: Storage Tank (-96.73468886, 30.96140815)", "SXL Migration - Vessel: Storage Tank (-96.81264450, 35.25165514)", "SXL Migration - Vessel: Storage Tank (-96.96868319, 35.33143721)", "SXL Migration - Vessel: Storage Tank (-96.96906944, 35.33148451)", "SXL Migration - Vessel: Storage Tank (-97.19945170, 31.12253577)", "SXL Migration - Vessel: Storage Tank (-97.71604952, 34.46314890)", "SXL Migration - Vessel: Storage Tank (-98.66932207, 32.98610201)", "SXL Migration - Vessel: Storage Tank (-98.70909806, 32.92037035)", "SXL Migration - Vessel: Storage Tank (-98.78621399, 32.87047081)", "SXL Migration - Vessel: Storage Tank (-98.80614166, 31.62554230)", "SXL Migration - Vessel: Storage Tank (-99.87580981, 31.76816907)", "SXL Migration - Vessel: Storage Tank (-99.88094050, 31.76869434)", "Tacoma Terminal (-122.4325778, 47.25852222)", "Tacoma Terminal", "Talpa (-99.64222614, 31.73906396)", "Talpa to Bronte - Odom to Ballinger Tanks 1", "Talpa", "Tatums (-97.44071199, 34.38543423)", "Tatums", "Temple  (-97.20007762, 31.12226842)", "Temple ", "Temple to Evant Tanks 1", "Temple to Evant Tanks 2", "TEX2 Millennium 12 Line 21010 Meter Skid", "TEX2 Millennium 12 Line 21010 RTU Building ", "Texaco (-96.74977626, 35.93978689)", "Texaco", "Texoma", "Thomas Station (-94.86787473, 32.47838201)", "Thomas Station", "Thomas ", "Toledo TORF (Sun) Terminal - TORF", "Tram Rd ", "Trans-Texas (-94.34668752, 29.83469931)" };

            var random1 = new Random();
            foreach (var site in siteName)
            {
                var index = random.Next(0, 100) % 2;
                _depDbContext.GFORM_SITE_HIERARCHY_MV.Add(new GFORM_SITE_HIERARCHY_MV()
                {
                    HIERARCHY_GLOBALID = Guid.NewGuid().ToString("B"),
                    DOT_OPERATOR_NAME = operators[index],
                    DIVISION_NAME = divisions[index],
                    AREA_NAME = areas[random.Next(0, areas.Length + 1) % areas.Length],
                    LOCATION = location[random.Next(0, location.Length + 1) % location.Length],
                    SITENAME = site,
                    SITETYPE = siteType[random.Next(0, siteType.Length + 1) % siteType.Length],
                });
            }
            _depDbContext.SaveChanges();

            #endregion

            #endregion
        }
    }
}
