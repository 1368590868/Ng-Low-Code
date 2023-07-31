﻿// <auto-generated />
using System;
using DataEditorPortal.Data.Contexts;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace DataEditorPortal.Data.Migrations.SqlServer
{
    [DbContext(typeof(DepDbContextSqlServer))]
    partial class DepDbContextSqlServerModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasDefaultSchema(Common.Constants.DEFAULT_SCHEMA)
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("ProductVersion", "5.0.17")
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("DataEditorPortal.Data.Models.DEMO_LINK_LOOKUP", b =>
                {
                    b.Property<string>("LOOKUPID")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("NAME1")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("NAME2")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("NAME3")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("NAME4")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("NAME5")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("NAME6")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("LOOKUPID");

                    b.ToTable("DEMO_LINK_LOOKUP");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.DEMO_LINK_PRIMARY", b =>
                {
                    b.Property<int>("OBJECTID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("ASSESSEDBY")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("BOUNDARYGLOBALID")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("COMMENTS")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("CREATIONUSER")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("CRITERIA")
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime?>("DATECREATED")
                        .HasColumnType("datetime2");

                    b.Property<DateTime?>("DATEMODIFIED")
                        .HasColumnType("datetime2");

                    b.Property<DateTime?>("DATETIME1")
                        .HasColumnType("datetime2");

                    b.Property<DateTime?>("DATETIME2")
                        .HasColumnType("datetime2");

                    b.Property<DateTime?>("DATETIME3")
                        .HasColumnType("datetime2");

                    b.Property<DateTime?>("DATETIME4")
                        .HasColumnType("datetime2");

                    b.Property<string>("EVENTID")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("FEATUREGLOBALID")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("GLOBALID")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("LASTUSER")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("NAME")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("STATUS")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("STATUS1")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("TYPE")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("OBJECTID");

                    b.ToTable("DEMO_LINK_PRIMARY");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.DEMO_LINK_RELATION", b =>
                {
                    b.Property<int>("OBJECTID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("LEFTID")
                        .HasColumnType("int");

                    b.Property<int>("RIGHTID")
                        .HasColumnType("int");

                    b.HasKey("OBJECTID");

                    b.ToTable("DEMO_LINK_RELATION");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.DEMO_LINK_SECONDARY", b =>
                {
                    b.Property<int>("OBJECTID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("ASSIGNEDTO")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("BOUNDARYGLOBALID")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("COMMENTS")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("CREATIONUSER")
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime?>("DATECREATED")
                        .HasColumnType("datetime2");

                    b.Property<DateTime?>("DATEMODIFIED")
                        .HasColumnType("datetime2");

                    b.Property<DateTime?>("DATETIME3")
                        .HasColumnType("datetime2");

                    b.Property<DateTime?>("DATETIME4")
                        .HasColumnType("datetime2");

                    b.Property<string>("EVENTID")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("FEATUREGLOBALID")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("GLOBALID")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("LASTUSER")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("STATUS")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("STATUS1")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("TYPE")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("OBJECTID");

                    b.ToTable("DEMO_LINK_SECONDARY");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.DataDictionary", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("ID");

                    b.Property<string>("Category")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("CATEGORY");

                    b.Property<string>("Label")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("LABEL");

                    b.Property<string>("Value")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("VALUE");

                    b.Property<string>("Value1")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("VALUE1");

                    b.Property<string>("Value2")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("VALUE2");

                    b.HasKey("Id");

                    b.ToTable("DATA_DICTIONARIES");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.DataImportHistory", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("ID");

                    b.Property<Guid>("CreatedById")
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("CREATED_BY");

                    b.Property<DateTime>("CreatedDate")
                        .HasColumnType("datetime2")
                        .HasColumnName("CREATED_DATE");

                    b.Property<Guid>("GridConfigurationId")
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("GRID_COINFG_ID");

                    b.Property<int>("ImportType")
                        .HasColumnType("int")
                        .HasColumnName("IMPORT_TYPE");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("NAME");

                    b.Property<string>("Result")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("RESULT");

                    b.Property<int>("Status")
                        .HasColumnType("int")
                        .HasColumnName("STATUS");

                    b.HasKey("Id");

                    b.HasIndex("CreatedById");

                    b.HasIndex("GridConfigurationId");

                    b.ToTable("DATA_IMPORT_HISTORIES");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.DataSourceConnection", b =>
                {
                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(450)")
                        .HasColumnName("NAME");

                    b.Property<string>("ConnectionString")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("CONNECTION_STRING");

                    b.Property<string>("IncludeSchemas")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("INCLUDE_SCHEMAS");

                    b.Property<string>("TableNameRule")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("TABLE_NAME_RULE");

                    b.HasKey("Name");

                    b.ToTable("DATA_SOURCE_CONNECTIONS");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.DemoTable", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("ID")
                        .HasDefaultValueSql("NEWID()");

                    b.Property<bool>("Checked")
                        .HasColumnType("bit")
                        .HasColumnName("CHECKED");

                    b.Property<DateTime>("CreateDate")
                        .HasColumnType("datetime2")
                        .HasColumnName("CREATE_DATE");

                    b.Property<string>("Division")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("DIVISION");

                    b.Property<string>("Employor")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("EMPLOYOR");

                    b.Property<string>("FirstName")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("FIRST_NAME");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("NAME");

                    b.Property<int>("Number")
                        .HasColumnType("int")
                        .HasColumnName("NUMBER");

                    b.Property<decimal>("Total")
                        .HasColumnType("decimal(18,2)")
                        .HasColumnName("TOTAL");

                    b.Property<string>("Vendor")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("VENDOR");

                    b.HasKey("Id");

                    b.ToTable("DEMO_TABLE");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.EventLog", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("ID");

                    b.Property<string>("Category")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("CATEGORY");

                    b.Property<string>("Details")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("DETAILS");

                    b.Property<string>("EventName")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("EVENT_NAME");

                    b.Property<string>("EventSection")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("EVENT_SECTION");

                    b.Property<DateTime>("EventTime")
                        .HasColumnType("datetime2")
                        .HasColumnName("EVENT_TIME");

                    b.Property<string>("Params")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("PARAMS");

                    b.Property<string>("Result")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("RESULT");

                    b.Property<string>("Username")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("USERNAME");

                    b.HasKey("Id");

                    b.ToTable("EVENT_LOGS");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.Lookup", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("ID");

                    b.Property<string>("DataSourceConnectionName")
                        .HasColumnType("nvarchar(450)")
                        .HasColumnName("DATA_SOURCE_CONNECTION_NAME");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("NAME");

                    b.Property<string>("QueryText")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("QUERY_TEXT");

                    b.Property<Guid?>("UniversalGridConfigurationId")
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("UNIVERSAL_GRID_CONFIG_ID");

                    b.HasKey("Id");

                    b.HasIndex("DataSourceConnectionName");

                    b.HasIndex("UniversalGridConfigurationId");

                    b.ToTable("LOOKUPS");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.SavedSearch", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("ID");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("NAME");

                    b.Property<string>("SearchParams")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("SEARCH_PARAMS");

                    b.Property<Guid?>("UniversalGridConfigurationId")
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("UNIVERSAL_GRID_CONFIG_ID");

                    b.HasKey("Id");

                    b.ToTable("SAVED_SEARCHES");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.SiteContent", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("ID");

                    b.Property<string>("Content")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("CONTENT");

                    b.Property<string>("ContentName")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("CONTENT_NAME");

                    b.Property<Guid?>("SiteGroupId")
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("SITE_GROUP_ID");

                    b.HasKey("Id");

                    b.ToTable("SITE_CONTENTS");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.SiteGroup", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("ID");

                    b.Property<string>("Description")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("DESCRIPTION");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("NAME");

                    b.Property<string>("Title")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("TITLE");

                    b.HasKey("Id");

                    b.ToTable("SITE_GROUPS");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.SiteMenu", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("ID");

                    b.Property<string>("Component")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("COMPONENT");

                    b.Property<string>("Description")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("DESCRIPTION");

                    b.Property<string>("HelpUrl")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("HELP_URL");

                    b.Property<string>("Icon")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("ICON");

                    b.Property<string>("Label")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("LABEL");

                    b.Property<string>("Link")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("LINK");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("NAME");

                    b.Property<int>("Order")
                        .HasColumnType("int")
                        .HasColumnName("ORDER");

                    b.Property<Guid?>("ParentId")
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("PARENT_ID");

                    b.Property<bool>("RequireAdmin")
                        .HasColumnType("bit")
                        .HasColumnName("REQUIRE_ADMIN");

                    b.Property<bool>("RequireAuth")
                        .HasColumnType("bit")
                        .HasColumnName("REQUIRE_AUTH");

                    b.Property<int>("Status")
                        .HasColumnType("int")
                        .HasColumnName("STATUS");

                    b.Property<string>("Type")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("TYPE");

                    b.HasKey("Id");

                    b.HasIndex("ParentId");

                    b.ToTable("SITE_MENUS");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.SitePermission", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("ID");

                    b.Property<string>("Category")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("CATEGORY");

                    b.Property<string>("PermissionDescription")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("PERMISSION_DESCRIPTION");

                    b.Property<string>("PermissionName")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("PERMISSION_NAME");

                    b.HasKey("Id");

                    b.ToTable("SITE_PERMISSIONS");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.SiteRole", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("ID");

                    b.Property<string>("RoleDescription")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("ROLE_DESCRIPTION");

                    b.Property<string>("RoleName")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("ROLE_NAME");

                    b.HasKey("Id");

                    b.ToTable("SITE_ROLES");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.SiteRolePermission", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("ID");

                    b.Property<Guid>("CreatedBy")
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("CREATED_BY");

                    b.Property<DateTime>("CreatedDate")
                        .HasColumnType("datetime2")
                        .HasColumnName("CREATED_DATE");

                    b.Property<Guid>("SitePermissionId")
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("SITE_PERMISSION_ID");

                    b.Property<Guid>("SiteRoleId")
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("SITE_ROLE_ID");

                    b.HasKey("Id");

                    b.HasIndex("SitePermissionId");

                    b.HasIndex("SiteRoleId");

                    b.ToTable("SITE_ROLE_PERMISSIONS");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.SiteSetting", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("ID");

                    b.Property<bool>("Installed")
                        .HasColumnType("bit")
                        .HasColumnName("INSTALLED");

                    b.Property<string>("License")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("LICENSE");

                    b.Property<string>("SiteLogo")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("SITE_LOGO");

                    b.Property<string>("SiteName")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("SITE_NAME");

                    b.HasKey("Id");

                    b.ToTable("SITE_SETTINGS");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.UniversalGridConfiguration", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("ID");

                    b.Property<string>("ColumnsConfig")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("COLUMNS_CONFIG");

                    b.Property<bool>("ConfigCompleted")
                        .HasColumnType("bit")
                        .HasColumnName("CONFIG_COMPLETED");

                    b.Property<Guid>("CreatedBy")
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("CREATED_BY");

                    b.Property<DateTime>("CreatedDate")
                        .HasColumnType("datetime2")
                        .HasColumnName("CREATED_DATE");

                    b.Property<string>("CurrentStep")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("CURRENT_STEP");

                    b.Property<string>("CustomActionConfig")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("CUSTOMACTION_CONFIG");

                    b.Property<string>("DataSourceConfig")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("DATA_SOURCE_CONFIG");

                    b.Property<string>("DataSourceConnectionName")
                        .HasColumnType("nvarchar(450)")
                        .HasColumnName("DATA_SOURCE_CONNECTION_NAME");

                    b.Property<string>("DetailConfig")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("DETAIL_CONFIG");

                    b.Property<string>("ItemType")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("ITEM_TYPE");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("NAME");

                    b.Property<string>("SearchConfig")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("SEARCH_CONFIG");

                    b.HasKey("Id");

                    b.HasIndex("DataSourceConnectionName");

                    b.ToTable("UNIVERSAL_GRID_CONFIGURATIONS");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.UploadedFile", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("nvarchar(450)")
                        .HasColumnName("ID");

                    b.Property<string>("Comments")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("COMMENTS");

                    b.Property<string>("ContentType")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("CONTENT_TYPE");

                    b.Property<string>("DataId")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("DATA_ID");

                    b.Property<byte[]>("FileBytes")
                        .HasColumnType("varbinary(max)")
                        .HasColumnName("FILE_BYTES");

                    b.Property<string>("FileName")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("FILE_NAME");

                    b.Property<string>("FilePath")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("FILE_PATH");

                    b.Property<string>("Status")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("STATUS");

                    b.HasKey("Id");

                    b.ToTable("UPLOADED_FILE");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.User", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("ID")
                        .HasDefaultValueSql("NEWID()");

                    b.Property<bool>("AutoEmail")
                        .HasColumnType("bit")
                        .HasColumnName("AUTO_EMAIL");

                    b.Property<string>("Comments")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("COMMENTS");

                    b.Property<string>("Email")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("EMAIL");

                    b.Property<string>("Employer")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("EMPLOYER");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("NAME");

                    b.Property<string>("Phone")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("PHONE");

                    b.Property<int>("UserId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("USER_ID")
                        .HasAnnotation("SqlServer:IdentityIncrement", 1)
                        .HasAnnotation("SqlServer:IdentitySeed", 1)
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("UserType")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("USER_TYPE");

                    b.Property<string>("Username")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("USERNAME");

                    b.Property<string>("Vendor")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("VENDOR");

                    b.HasKey("Id");

                    b.ToTable("USERS");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.UserPermission", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("ID");

                    b.Property<Guid>("CreatedBy")
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("CREATED_BY");

                    b.Property<DateTime>("CreatedDate")
                        .HasColumnType("datetime2")
                        .HasColumnName("CREATED_DATE");

                    b.Property<string>("GrantType")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("GRANT_TYPE");

                    b.Property<Guid>("PermissionGrantId")
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("PERMISSION_GRANT_ID");

                    b.Property<Guid>("UserId")
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("USER_ID");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("USER_PERMISSIONS");
                });

            modelBuilder.Entity("SiteGroupSiteMenu", b =>
                {
                    b.Property<Guid>("SiteGroupsId")
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("SITE_GROUP_ID");

                    b.Property<Guid>("SiteMenusId")
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("SITE_MENU_ID");

                    b.HasKey("SiteGroupsId", "SiteMenusId");

                    b.HasIndex("SiteMenusId");

                    b.ToTable("SITE_GROUP_SITE_MENU");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.DataImportHistory", b =>
                {
                    b.HasOne("DataEditorPortal.Data.Models.User", "CreatedBy")
                        .WithMany()
                        .HasForeignKey("CreatedById")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("DataEditorPortal.Data.Models.UniversalGridConfiguration", "GridConfiguration")
                        .WithMany()
                        .HasForeignKey("GridConfigurationId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("CreatedBy");

                    b.Navigation("GridConfiguration");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.Lookup", b =>
                {
                    b.HasOne("DataEditorPortal.Data.Models.DataSourceConnection", "DataSourceConnection")
                        .WithMany()
                        .HasForeignKey("DataSourceConnectionName");

                    b.HasOne("DataEditorPortal.Data.Models.UniversalGridConfiguration", null)
                        .WithMany("Lookups")
                        .HasForeignKey("UniversalGridConfigurationId");

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
                        .HasForeignKey("DataSourceConnectionName");

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

            modelBuilder.Entity("SiteGroupSiteMenu", b =>
                {
                    b.HasOne("DataEditorPortal.Data.Models.SiteGroup", null)
                        .WithMany()
                        .HasForeignKey("SiteGroupsId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("DataEditorPortal.Data.Models.SiteMenu", null)
                        .WithMany()
                        .HasForeignKey("SiteMenusId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.DataSourceConnection", b =>
                {
                    b.Navigation("UniversalGridConfigurations");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.UniversalGridConfiguration", b =>
                {
                    b.Navigation("Lookups");
                });
#pragma warning restore 612, 618
        }
    }
}
