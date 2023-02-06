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
    [Migration("20230206151856_userCustomActions")]
    partial class userCustomActions
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasDefaultSchema("dep")
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("ProductVersion", "5.0.17")
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("DataEditorPortal.Data.Models.Lookup", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("QueryText")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("Lookups");
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
                            Id = new Guid("cbf29ec9-b605-45f1-a84f-5a7fc99ad6b3"),
                            Icon = "pi pi-wrench",
                            Label = "Site Settings",
                            Link = "",
                            Name = "site-settings",
                            Order = 2,
                            ParentId = new Guid("b82dfe59-e51a-4771-b876-05d62f4207e3"),
                            Status = 1,
                            Type = "System"
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

                    b.Property<string>("DetailConfig")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("SearchConfig")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("UniversalGridConfigurations");

                    b.HasData(
                        new
                        {
                            Id = new Guid("071f5419-85b8-11ed-a86f-0242ac130004"),
                            ColumnsConfig = "[{\"field\":\"Username\",\"header\":\"CNP ID\",\"width\":\"130px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Name\",\"header\":\"Name\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Email\",\"header\":\"Email\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Phone\",\"header\":\"Phone\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"AutoEmail\",\"header\":\"Auto Email\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Vendor\",\"header\":\"Vendor\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Employer\",\"header\":\"Employer\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true},{\"field\":\"Division\",\"header\":\"Division\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":false},{\"field\":\"Comments\",\"header\":\"Comments\",\"width\":\"250px\",\"filterType\":\"text\",\"sortable\":true}]",
                            ConfigCompleted = true,
                            CreatedBy = new Guid("00000000-0000-0000-0000-000000000000"),
                            CreatedDate = new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            CustomActionConfig = "[{\"name\":\"edit-role\"},{\"name\":\"edit-permission\"},{\"name\":\"manage-roles\"}]",
                            DataSourceConfig = "{\"TableName\":\"Users\",\"TableSchema\":\"dep\",\"IdColumn\":\"Id\",\"Columns\":[\"Id\",\"Username\",\"Name\",\"Email\",\"Phone\",\"AutoEmail\",\"Vendor\",\"Employer\",\"Division\",\"Comments\"],\"SortBy\":[{\"field\":\"Name\",\"order\":1}]}",
                            DetailConfig = "{\"AllowExport\":true,\"AllowDelete\":true,\"AllowEdit\":true,\"UseCustomForm\":true,\"CustomAddFormName\":\"user-manager-add\",\"CustomEditFormName\":\"user-manager-edit\",\"CustomViewFormName\":\"user-manager-view\"}",
                            Name = "user-management",
                            SearchConfig = "[{\"key\":\"username\",\"type\":\"input\",\"filterType\":\"text\",\"props\":{\"label\":\"CNP ID\",\"placeholder\":\"CNP ID\"},\"searchRule\":{\"field\":\"Username\",\"matchMode\":\"contains\"}},{\"key\":\"name\",\"type\":\"input\",\"filterType\":\"text\",\"props\":{\"label\":\"Name\",\"placeholder\":\"Name\"},\"searchRule\":{\"field\":\"Name\",\"matchMode\":\"contains\"}},{\"key\":\"roles\",\"type\":\"select\",\"filterType\":\"text\",\"props\":{\"label\":\"Roles\",\"placeholder\":\"Please select\",\"options\":[{\"value\":1,\"label\":\"Option 1\"},{\"value\":2,\"label\":\"Option 2\"},{\"value\":3,\"label\":\"Option 3\"},{\"value\":4,\"label\":\"Option 4\"}]},\"searchRule\":{\"whereClause\":\"Id in (select UserId from USERID_PERMISSION where PERMISSION_GRANT_ID = \\u0027{0}\\u0027)\"}},{\"key\":\"vendor\",\"type\":\"select\",\"filterType\":\"text\",\"props\":{\"label\":\"Vendor\",\"placeholder\":\"Please select\",\"options\":[{\"value\":1,\"label\":\"Option 1\"},{\"value\":2,\"label\":\"Option 2\"},{\"value\":3,\"label\":\"Option 3\"},{\"value\":4,\"label\":\"Option 4\"}]},\"searchRule\":{\"field\":\"Vendor\",\"matchMode\":\"contains\"}},{\"key\":\"employer\",\"type\":\"select\",\"filterType\":\"text\",\"props\":{\"label\":\"Employer\",\"placeholder\":\"Please select\",\"options\":[{\"value\":1,\"label\":\"Option 1\"},{\"value\":2,\"label\":\"Option 2\"},{\"value\":3,\"label\":\"Option 3\"},{\"value\":4,\"label\":\"Option 4\"}]},\"searchRule\":{\"field\":\"Employer\",\"matchMode\":\"contains\"}}]"
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

                    b.Property<string>("Division")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Email")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Employer")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Phone")
                        .HasColumnType("nvarchar(max)");

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

            modelBuilder.Entity("DataEditorPortal.Data.Models.UserPermission", b =>
                {
                    b.HasOne("DataEditorPortal.Data.Models.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });
#pragma warning restore 612, 618
        }
    }
}
