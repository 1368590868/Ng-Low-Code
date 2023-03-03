﻿// <auto-generated />
using System;
using DataEditorPortal.Data.Contexts;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    [DbContext(typeof(DepDbContextSqlServer))]
    [Migration("20230303060911_eventLogs")]
    partial class eventLogs
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasDefaultSchema("dep")
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("ProductVersion", "5.0.17")
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("DataEditorPortal.Data.Models.DataDictionary", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("Category")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Label")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Value")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Value1")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Value2")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("DataDictionaries");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.DataSourceConnection", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("ConnectionString")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("DataSourceConnections");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.DemoTable", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier")
                        .HasDefaultValueSql("NEWID()");

                    b.Property<bool>("Checked")
                        .HasColumnType("bit");

                    b.Property<DateTime>("CreateDate")
                        .HasColumnType("datetime2");

                    b.Property<string>("Division")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Employor")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("FirstName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("Number")
                        .HasColumnType("int");

                    b.Property<decimal>("Total")
                        .HasColumnType("decimal(18,2)");

                    b.Property<string>("Vendor")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("DemoTables", "dbo");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.EventLog", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("Category")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Details")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("EventName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("EventSection")
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime>("EventTime")
                        .HasColumnType("datetime2");

                    b.Property<string>("Params")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Result")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Username")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("EventLogs");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.Lookup", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<Guid>("DataSourceConnectionId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("QueryText")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.HasIndex("DataSourceConnectionId");

                    b.ToTable("Lookups");

                    b.HasData(
                        new
                        {
                            Id = new Guid("727052ba-0033-42c9-a39c-06a103e4b021"),
                            DataSourceConnectionId = new Guid("00000000-0000-0000-0000-000000000000"),
                            Name = "Roles",
                            QueryText = "SELECT sr.RoleName AS Label, sr.Id AS Value FROM dep.SiteRoles sr ORDER BY sr.RoleName"
                        },
                        new
                        {
                            Id = new Guid("e1f3e2c7-25ca-4d69-9405-abc54923864d"),
                            DataSourceConnectionId = new Guid("00000000-0000-0000-0000-000000000000"),
                            Name = "Vendors",
                            QueryText = "SELECT dd.Label, dd.Value FROM dep.DataDictionaries dd WHERE dd.Category = 'Vendor' ORDER BY dd.Label"
                        },
                        new
                        {
                            Id = new Guid("704a3d00-62df-4c62-a4bd-457c4dc242ca"),
                            DataSourceConnectionId = new Guid("00000000-0000-0000-0000-000000000000"),
                            Name = "Employers",
                            QueryText = "SELECT dd.Label, dd.Value, dd.Value1, dd.Value2 FROM dep.DataDictionaries dd WHERE dd.Category = 'Employer' {{ AND dd.Value1 IN ##vendor## }} ORDER BY dd.Label"
                        });
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.SiteMenu", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("Description")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Icon")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Label")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Link")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("Order")
                        .HasColumnType("int");

                    b.Property<Guid?>("ParentId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<int>("Status")
                        .HasColumnType("int");

                    b.Property<string>("Type")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.HasIndex("ParentId");

                    b.ToTable("SiteMenus");

                    b.HasData(
                        new
                        {
                            Id = new Guid("b82dfe59-e51a-4771-b876-05d62f4207e3"),
                            Icon = "pi pi-cog",
                            Label = "Settings",
                            Link = "",
                            Name = "settings",
                            Order = 999,
                            Status = 1,
                            Type = "System"
                        },
                        new
                        {
                            Id = new Guid("b4b490ea-9df3-4f7a-8806-936ca7f87b8f"),
                            Icon = "pi pi-desktop",
                            Label = "Portal Management",
                            Link = "/portal-management/list",
                            Name = "portal-management",
                            Order = 0,
                            ParentId = new Guid("b82dfe59-e51a-4771-b876-05d62f4207e3"),
                            Status = 1,
                            Type = "System"
                        },
                        new
                        {
                            Id = new Guid("4e22e18e-492e-4786-8170-fb8f0c9d3a62"),
                            Icon = "pi pi-user",
                            Label = "User Management",
                            Link = "/portal-item/user-management",
                            Name = "user-management",
                            Order = 1,
                            ParentId = new Guid("b82dfe59-e51a-4771-b876-05d62f4207e3"),
                            Status = 1,
                            Type = "System"
                        },
                        new
                        {
                            Id = new Guid("32b6e555-846f-4050-a22d-d40d39e0b71f"),
                            Icon = "pi pi-book",
                            Label = "Data Dictionary",
                            Link = "/data-dictionary",
                            Name = "data-dictionary",
                            Order = 2,
                            ParentId = new Guid("b82dfe59-e51a-4771-b876-05d62f4207e3"),
                            Status = 1,
                            Type = "System"
                        },
                        new
                        {
                            Id = new Guid("cbf29ec9-b605-45f1-a84f-5a7fc99ad6b3"),
                            Icon = "pi pi-wrench",
                            Label = "Site Settings",
                            Link = "/site-settings",
                            Name = "site-settings",
                            Order = 3,
                            ParentId = new Guid("b82dfe59-e51a-4771-b876-05d62f4207e3"),
                            Status = 1,
                            Type = "System"
                        },
                        new
                        {
                            Id = new Guid("b0864169-8ca1-49e4-ae1e-bfc53756231b"),
                            Icon = "pi pi-clock",
                            Label = "System Event Logs",
                            Link = "/system-event-logs",
                            Name = "system-event-logs",
                            Order = 4,
                            ParentId = new Guid("b82dfe59-e51a-4771-b876-05d62f4207e3"),
                            Status = 1,
                            Type = "System"
                        },
                        new
                        {
                            Id = new Guid("41d85a79-9e84-4ab8-af96-08daf9cd4412"),
                            Icon = "pi pi-list",
                            Label = "Demo Items",
                            Link = "",
                            Name = "demo",
                            Order = 998,
                            Status = 1,
                            Type = "Folder"
                        },
                        new
                        {
                            Id = new Guid("92a804c3-ca4b-4987-5659-08db05b2de84"),
                            Icon = "pi pi-table",
                            Label = "Demo Item",
                            Link = "",
                            Name = "demo-item",
                            Order = 0,
                            ParentId = new Guid("41d85a79-9e84-4ab8-af96-08daf9cd4412"),
                            Status = 1,
                            Type = "Portal Item"
                        });
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.SitePermission", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("Category")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("PermissionDescription")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("PermissionName")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("SitePermissions");

                    b.HasData(
                        new
                        {
                            Id = new Guid("23a76524-d095-493e-8603-173c21e9c3cb"),
                            Category = "Portal Item: User Management",
                            PermissionDescription = "View User Management",
                            PermissionName = "VIEW_USER_MANAGEMENT"
                        },
                        new
                        {
                            Id = new Guid("1eca5d20-6c93-4296-8328-d27ded7a30fc"),
                            Category = "Portal Item: User Management",
                            PermissionDescription = "Add User Management",
                            PermissionName = "ADD_USER_MANAGEMENT"
                        },
                        new
                        {
                            Id = new Guid("2f80b74d-7e82-4df0-ad77-3fda22b8f454"),
                            Category = "Portal Item: User Management",
                            PermissionDescription = "Edit User Management",
                            PermissionName = "EDIT_USER_MANAGEMENT"
                        },
                        new
                        {
                            Id = new Guid("a05a95e3-e010-4377-840d-d55025069ed0"),
                            Category = "Portal Item: User Management",
                            PermissionDescription = "Delete User Management",
                            PermissionName = "DELETE_USER_MANAGEMENT"
                        },
                        new
                        {
                            Id = new Guid("ccf158bb-7da8-42f7-a18f-7291c871d996"),
                            Category = "Portal Item: User Management",
                            PermissionDescription = "Export User Management",
                            PermissionName = "EXPORT_USER_MANAGEMENT"
                        },
                        new
                        {
                            Id = new Guid("06a315cd-cf13-42cf-8bae-1f6680651b58"),
                            Category = "Portal Item: Demo Item",
                            PermissionDescription = "View Demo Item",
                            PermissionName = "VIEW_DEMO_ITEM"
                        },
                        new
                        {
                            Id = new Guid("804b67e6-ab28-4376-8ce4-98e40515f3b6"),
                            Category = "Portal Item: Demo Item",
                            PermissionDescription = "Add Demo Item",
                            PermissionName = "ADD_DEMO_ITEM"
                        },
                        new
                        {
                            Id = new Guid("33881049-8096-47be-866f-cc686a9bf587"),
                            Category = "Portal Item: Demo Item",
                            PermissionDescription = "Edit Demo Item",
                            PermissionName = "EDIT_DEMO_ITEM"
                        },
                        new
                        {
                            Id = new Guid("3145d3c8-8d13-495d-8dd3-525b3d4eba33"),
                            Category = "Portal Item: Demo Item",
                            PermissionDescription = "Delete Demo Item",
                            PermissionName = "DELETE_DEMO_ITEM"
                        },
                        new
                        {
                            Id = new Guid("155a1215-214b-4a89-acaf-72c48aebb1e9"),
                            Category = "Portal Item: Demo Item",
                            PermissionDescription = "Export Demo Item",
                            PermissionName = "EXPORT_DEMO_ITEM"
                        });
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.SiteRole", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("RoleDescription")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("RoleName")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("SiteRoles");

                    b.HasData(
                        new
                        {
                            Id = new Guid("790d7db8-feb2-40f8-8f74-5f228c0ada03"),
                            RoleName = "Administrators"
                        },
                        new
                        {
                            Id = new Guid("33d70a90-0c4c-48ee-ad8f-3051448d19cf"),
                            RoleName = "Users"
                        });
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.SiteRolePermission", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<Guid>("CreatedBy")
                        .HasColumnType("uniqueidentifier");

                    b.Property<DateTime>("CreatedDate")
                        .HasColumnType("datetime2");

                    b.Property<Guid>("SitePermissionId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<Guid>("SiteRoleId")
                        .HasColumnType("uniqueidentifier");

                    b.HasKey("Id");

                    b.HasIndex("SitePermissionId");

                    b.HasIndex("SiteRoleId");

                    b.ToTable("SiteRolePermissions");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.SiteSetting", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("SiteLogo")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("SiteName")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("SiteSettings");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.UniversalGridConfiguration", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("ColumnsConfig")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("ConfigCompleted")
                        .HasColumnType("bit");

                    b.Property<Guid>("CreatedBy")
                        .HasColumnType("uniqueidentifier");

                    b.Property<DateTime>("CreatedDate")
                        .HasColumnType("datetime2");

                    b.Property<string>("CurrentStep")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("CustomActionConfig")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("DataSourceConfig")
                        .HasColumnType("nvarchar(max)");

                    b.Property<Guid?>("DataSourceConnectionId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("DetailConfig")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("SearchConfig")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.HasIndex("DataSourceConnectionId");

                    b.ToTable("UniversalGridConfigurations");

                    b.HasData(
                        new
                        {
                            Id = new Guid("071f5419-85b8-11ed-a86f-0242ac130004"),
                            ColumnsConfig = "[{\"type\":\"DataBaseField\",\"field\":\"Username\",\"header\":\"CNP ID\",\"width\":\"130px\",\"filterType\":\"text\",\"sortable\":true},{\"type\":\"DataBaseField\",\"field\":\"Name\",\"header\":\"Name\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"type\":\"DataBaseField\",\"field\":\"Email\",\"header\":\"Email\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"type\":\"DataBaseField\",\"field\":\"Phone\",\"header\":\"Phone\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"type\":\"DataBaseField\",\"field\":\"AutoEmail\",\"header\":\"Auto Email\",\"width\":\"250px\",\"filterType\":\"boolean\",\"sortable\":true},{\"type\":\"DataBaseField\",\"field\":\"Vendor\",\"header\":\"Vendor\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"type\":\"DataBaseField\",\"field\":\"Employer\",\"header\":\"Employer\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"type\":\"DataBaseField\",\"field\":\"Comments\",\"header\":\"Comments\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true}]",
                            ConfigCompleted = true,
                            CreatedBy = new Guid("00000000-0000-0000-0000-000000000000"),
                            CreatedDate = new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            CustomActionConfig = "[{\"Name\":\"edit-role\"},{\"Name\":\"edit-permission\"},{\"Name\":\"manage-roles\"}]",
                            DataSourceConfig = "{\"TableName\":\"Users\",\"TableSchema\":\"dep\",\"IdColumn\":\"Id\",\"Columns\":[\"Id\",\"Username\",\"Name\",\"Email\",\"Phone\",\"AutoEmail\",\"Vendor\",\"Employer\",\"Comments\"],\"SortBy\":[{\"field\":\"Name\",\"order\":1}]}",
                            DetailConfig = "{\"AddingForm\":{\"UseCustomForm\":true,\"CustomFormName\":\"user-manager-add\"},\"UpdatingForm\":{\"UseCustomForm\":true,\"CustomFormName\":\"user-manager-edit\"}}",
                            Name = "user-management",
                            SearchConfig = "[{\"key\":\"username\",\"type\":\"input\",\"filterType\":\"text\",\"props\":{\"label\":\"CNP ID\",\"placeholder\":\"CNP ID\"},\"searchRule\":{\"field\":\"Username\",\"matchMode\":\"contains\"}},{\"key\":\"name\",\"type\":\"input\",\"filterType\":\"text\",\"props\":{\"label\":\"Name\",\"placeholder\":\"Name\"},\"searchRule\":{\"field\":\"Name\",\"matchMode\":\"contains\"}},{\"key\":\"roles\",\"type\":\"multiSelect\",\"filterType\":\"text\",\"props\":{\"label\":\"Roles\",\"placeholder\":\"Please select\",\"optionsLookup\":\"727052BA-0033-42C9-A39C-06A103E4B021\"},\"searchRule\":{\"whereClause\":\"Id in (select UserId from dep.UserPermissions where PermissionGrantId in (##VALUE##))\"}},{\"key\":\"vendor\",\"type\":\"multiSelect\",\"filterType\":\"text\",\"props\":{\"label\":\"Vendor\",\"placeholder\":\"Please select\",\"optionsLookup\":\"E1F3E2C7-25CA-4D69-9405-ABC54923864D\"},\"searchRule\":{\"field\":\"Vendor\",\"matchMode\":\"in\"}},{\"key\":\"employer\",\"type\":\"multiSelect\",\"filterType\":\"text\",\"props\":{\"label\":\"Employer\",\"placeholder\":\"Please select\",\"optionsLookup\":\"704A3D00-62DF-4C62-A4BD-457C4DC242CA\",\"dependOnFields\":[\"vendor\"]},\"searchRule\":{\"field\":\"Employer\",\"matchMode\":\"in\"}}]"
                        },
                        new
                        {
                            Id = new Guid("82cfa0d5-1033-4a08-8294-4d4bc2de3d6b"),
                            ColumnsConfig = "[{\"type\":\"DataBaseField\",\"field\":\"Name\",\"header\":\"Name\",\"width\":\"130px\",\"filterType\":\"text\",\"sortable\":true},{\"type\":\"DataBaseField\",\"field\":\"FirstName\",\"header\":\"First Name\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"type\":\"DataBaseField\",\"field\":\"Checked\",\"header\":\"Checked\",\"width\":\"250px\",\"filterType\":\"boolean\",\"sortable\":false},{\"type\":\"DataBaseField\",\"field\":\"Number\",\"header\":\"Number\",\"width\":\"250px\",\"filterType\":\"numeric\",\"sortable\":true},{\"type\":\"DataBaseField\",\"field\":\"Total\",\"header\":\"Total\",\"width\":\"250px\",\"filterType\":\"numeric\",\"sortable\":true},{\"type\":\"DataBaseField\",\"field\":\"CreateDate\",\"header\":\"Create Date\",\"width\":\"250px\",\"filterType\":\"date\",\"sortable\":true}]",
                            ConfigCompleted = true,
                            CreatedBy = new Guid("00000000-0000-0000-0000-000000000000"),
                            CreatedDate = new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            CustomActionConfig = "[]",
                            DataSourceConfig = "{\"TableName\":\"DemoTables\",\"TableSchema\":\"dbo\",\"IdColumn\":\"Id\",\"Columns\":[],\"SortBy\":[]}",
                            DetailConfig = "{\"AddingForm\":{\"UseCustomForm\":false,\"FormFields\":[{\"filterType\":\"text\",\"key\":\"Name\",\"type\":\"input\",\"props\":{\"label\":\"Name\",\"required\":true}},{\"filterType\":\"text\",\"key\":\"FirstName\",\"type\":\"input\",\"props\":{\"label\":\"First Name\",\"required\":true}},{\"filterType\":\"boolean\",\"key\":\"Checked\",\"type\":\"checkbox\",\"props\":{\"label\":\"Checked\",\"required\":true}},{\"filterType\":\"numeric\",\"key\":\"Number\",\"type\":\"inputNumber\",\"props\":{\"label\":\"Number\",\"maxFractionDigits\":0,\"required\":true}},{\"filterType\":\"numeric\",\"key\":\"Total\",\"type\":\"inputNumber\",\"props\":{\"label\":\"Total\",\"required\":true}},{\"filterType\":\"date\",\"key\":\"CreateDate\",\"type\":\"datepicker\",\"props\":{\"label\":\"Create Date\",\"required\":true}}]},\"UpdatingForm\":{\"UseAddingFormLayout\":true}}",
                            Name = "demo-item",
                            SearchConfig = "[{\"key\":\"FirstName\",\"type\":\"input\",\"filterType\":\"text\",\"props\":{\"label\":\"First Name\",\"placeholder\":\"Enter First Name\"},\"searchRule\":{\"field\":\"FirstName\",\"matchMode\":\"contains\"}},{\"key\":\"Number\",\"type\":\"inputNumber\",\"filterType\":\"numeric\",\"props\":{\"label\":\"Number\",\"placeholder\":\"Enter Number\"},\"searchRule\":{\"field\":\"Number\",\"matchMode\":\"gt\"}},{\"key\":\"Name\",\"type\":\"multiSelect\",\"filterType\":\"text\",\"props\":{\"label\":\"Names\",\"placeholder\":\"Please select\",\"options\":[{\"value\":\"James\",\"label\":\"James\"},{\"value\":\"Robert\",\"label\":\"Robert\"},{\"value\":\"John\",\"label\":\"John\"},{\"value\":\"Michael\",\"label\":\"Michael\"}]},\"searchRule\":{\"field\":\"Name\",\"matchMode\":\"in\"}},{\"key\":\"CreateDate\",\"type\":\"datepicker\",\"filterType\":\"date\",\"props\":{\"label\":\"Create Date\",\"placeholder\":\"Please select\"},\"searchRule\":{\"field\":\"CreateDate\",\"matchMode\":\"dateAfter\"}},{\"key\":\"Checked\",\"type\":\"checkbox\",\"filterType\":\"boolean\",\"props\":{\"label\":\"Checked\"},\"searchRule\":{\"field\":\"Checked\",\"matchMode\":\"equals\"}}]"
                        });
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.User", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier")
                        .HasDefaultValueSql("NEWID()");

                    b.Property<bool>("AutoEmail")
                        .HasColumnType("bit");

                    b.Property<string>("Comments")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Email")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Employer")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Phone")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("UserId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:IdentityIncrement", 1)
                        .HasAnnotation("SqlServer:IdentitySeed", 1)
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("UserType")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Username")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Vendor")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.UserPermission", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<Guid>("CreatedBy")
                        .HasColumnType("uniqueidentifier");

                    b.Property<DateTime>("CreatedDate")
                        .HasColumnType("datetime2");

                    b.Property<string>("GrantType")
                        .HasColumnType("nvarchar(max)");

                    b.Property<Guid>("PermissionGrantId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<Guid>("UserId")
                        .HasColumnType("uniqueidentifier");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("UserPermissions");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.Lookup", b =>
                {
                    b.HasOne("DataEditorPortal.Data.Models.DataSourceConnection", "DataSourceConnection")
                        .WithMany()
                        .HasForeignKey("DataSourceConnectionId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("DataSourceConnection");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.SiteMenu", b =>
                {
                    b.HasOne("DataEditorPortal.Data.Models.SiteMenu", "Parent")
                        .WithMany()
                        .HasForeignKey("ParentId");

                    b.Navigation("Parent");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.SiteRolePermission", b =>
                {
                    b.HasOne("DataEditorPortal.Data.Models.SitePermission", "SitePermission")
                        .WithMany()
                        .HasForeignKey("SitePermissionId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("DataEditorPortal.Data.Models.SiteRole", "SiteRole")
                        .WithMany()
                        .HasForeignKey("SiteRoleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("SitePermission");

                    b.Navigation("SiteRole");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.UniversalGridConfiguration", b =>
                {
                    b.HasOne("DataEditorPortal.Data.Models.DataSourceConnection", "DataSourceConnection")
                        .WithMany("UniversalGridConfigurations")
                        .HasForeignKey("DataSourceConnectionId");

                    b.Navigation("DataSourceConnection");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.UserPermission", b =>
                {
                    b.HasOne("DataEditorPortal.Data.Models.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.DataSourceConnection", b =>
                {
                    b.Navigation("UniversalGridConfigurations");
                });
#pragma warning restore 612, 618
        }
    }
}
