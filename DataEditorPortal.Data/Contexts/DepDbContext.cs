using DataEditorPortal.Data.Models;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;

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

        public virtual DbSet<UniversalGridConfiguration> UniversalGridConfigurations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UniversalGridConfiguration>().HasData(
                new UniversalGridConfiguration()
                {
                    Id = Guid.Parse("071f5419-85b8-11ed-a86f-0242ac130004"),
                    Name = "UserManagement",
                    Description = "User Management",
                    Icon = "",

                    DataSourceConfig = JsonConvert.SerializeObject(new
                    {
                        TableName = "Users",
                        IdColumn = "Id",
                        Columns = new List<string>() { "Id", "Username", "Name", "Email", "Phone", "AutoEmail", "Vendor", "Employer", "Division", "Comments" },
                        SortBy = new List<object>() { new { field = "Name", order = 1 } }
                    }),

                    ColumnsConfig = JsonConvert.SerializeObject(new object[] {
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

                    SearchConfig = JsonConvert.SerializeObject(new object[] {
                        new {
                            Name= "Username",
                            Label= "CNP ID",
                            // WhereClause= "upper(USERID) like upper('%{0}%')",
                            Type= "pInputText"
                        },
                        new {
                            Name= "NAME",
                            Label= "Name",
                            // WhereClause= "upper(NAME) like upper('%{0}%')",
                            Type= "pInputText"
                        }
                    }),

                    CreatedBy = Guid.Empty,
                    CreatedDate = new DateTime(2022, 12, 26)
                }
            );
        }
    }
}
