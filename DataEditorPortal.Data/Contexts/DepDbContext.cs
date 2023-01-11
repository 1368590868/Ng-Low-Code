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

        public virtual DbSet<User> Users { get; set; }
        public virtual DbSet<UserPermission> UserPermissions { get; set; }
        public virtual DbSet<SiteRole> SiteRoles { get; set; }
        public virtual DbSet<SitePermission> SitePermissions { get; set; }
        public virtual DbSet<SitePermissionRole> SitePermissionRoles { get; set; }

        public virtual DbSet<SiteMenu> SiteMenus { get; set; }

        public virtual DbSet<UniversalGridConfiguration> UniversalGridConfigurations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UniversalGridConfiguration>().HasData(
                new UniversalGridConfiguration()
                {
                    Id = Guid.Parse("071f5419-85b8-11ed-a86f-0242ac130004"),
                    Name = "UserManagement",

                    DataSourceConfig = JsonSerializer.Serialize(new
                    {
                        TableName = "Users",
                        IdColumn = "Id",
                        Columns = new List<string>() { "Id", "Username", "Name", "Email", "Phone", "AutoEmail", "Vendor", "Employer", "Division", "Comments" },
                        SortBy = new List<object>() { new { field = "Name", order = 1 } }
                    }),

                    ColumnsConfig = JsonSerializer.Serialize(new object[] {
                        new { field = "Username", header = "CNP ID", width = "130px", filterType = "text" },
                        new { field = "Name", header = "Name", width = "250px", filterType = "text" },
                        new { field = "Email", header = "Email", width = "250px", filterType = "text" },
                        new { field = "Phone", header = "Phone", width = "250px", filterType = "text" },
                        new { field = "AutoEmail", header = "Auto Email", width = "250px", filterType = "text" },
                        new { field = "Vendor", header = "Vendor", width = "250px", filterType = "text" },
                        new { field = "Employer", header = "Employer", width = "250px", filterType = "text" },
                        new { field = "Division", header = "Division", width = "250px", filterType = "text" },
                        new { field = "Comments", header = "Comments", width = "250px", filterType = "text" }
                    }),

                    SearchConfig = JsonSerializer.Serialize(new object[] {
                        new {
                            key = "username",
                            type = "input",
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
                        UseCustomAction = false,
                        FormConfig = new object[] {
                            new {
                                key = "Username",
                                type = "input",
                                props = new {
                                    label = "CNP ID",
                                    placeholder = "CNP ID",
                                    required= true
                                }
                            },
                            new {
                                key = "Name",
                                type = "input",
                                props = new {
                                    label = "Name",
                                    placeholder = "Name",
                                    required= true
                                }
                            },
                            new {
                                key = "Email",
                                type = "input",
                                props = new {
                                    label = "Email",
                                    placeholder = "Email",
                                    required= true
                                }
                            },
                            new {
                                key = "Phone",
                                type = "input",
                                props = new {
                                    label = "Phone",
                                    placeholder = "Phone",
                                    required= true
                                }
                            },
                            new {
                                key = "Vendor",
                                type = "input",
                                props = new {
                                    label = "Vendor",
                                    placeholder = "Vendor"
                                }
                            },
                            new {
                                key = "Employer",
                                type = "input",
                                props = new {
                                    label = "Employer",
                                    placeholder = "Employer"
                                }
                            }
                        }
                    })
                }
            );
            modelBuilder.Entity<SiteMenu>().HasData(
                new SiteMenu()
                {
                    Id = new Guid("4E22E18E-492E-4786-8170-FB8F0C9D3A62"),
                    Name = "UserManagement",
                    Label = "User Management",
                    Icon = "pi pi-fw pi-user",
                    Type = "PortalItem"
                }
            );
        }
    }
}
