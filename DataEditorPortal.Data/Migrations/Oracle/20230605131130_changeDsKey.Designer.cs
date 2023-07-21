﻿// <auto-generated />
using System;
using DataEditorPortal.Data.Contexts;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Oracle.EntityFrameworkCore.Metadata;

namespace DataEditorPortal.Data.Migrations.Oracle
{
    [DbContext(typeof(DepDbContextOracle))]
    [Migration("20230605131130_changeDsKey")]
    partial class changeDsKey
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasDefaultSchema(Data.Common.Constants.DEFAULT_SCHEMA)
                .HasAnnotation("Relational:MaxIdentifierLength", 30)
                .HasAnnotation("ProductVersion", "5.0.17")
                .HasAnnotation("Oracle:ValueGenerationStrategy", OracleValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("DataEditorPortal.Data.Models.DataDictionary", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("RAW(16)")
                        .HasColumnName("ID");

                    b.Property<string>("Category")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("CATEGORY");

                    b.Property<string>("Label")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("LABEL");

                    b.Property<string>("Value")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("VALUE");

                    b.Property<string>("Value1")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("VALUE1");

                    b.Property<string>("Value2")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("VALUE2");

                    b.HasKey("Id");

                    b.ToTable("DATA_DICTIONARIES");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.DataImportHistory", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("RAW(16)")
                        .HasColumnName("ID");

                    b.Property<Guid>("CreatedById")
                        .HasColumnType("RAW(16)")
                        .HasColumnName("CREATED_BY");

                    b.Property<DateTime>("CreatedDate")
                        .HasColumnType("TIMESTAMP(7)")
                        .HasColumnName("CREATED_DATE");

                    b.Property<Guid>("GridConfigurationId")
                        .HasColumnType("RAW(16)")
                        .HasColumnName("GRID_COINFG_ID");

                    b.Property<int>("ImportType")
                        .HasColumnType("NUMBER(10)")
                        .HasColumnName("IMPORT_TYPE");

                    b.Property<string>("Name")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("NAME");

                    b.Property<string>("Result")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("RESULT");

                    b.Property<int>("Status")
                        .HasColumnType("NUMBER(10)")
                        .HasColumnName("STATUS");

                    b.HasKey("Id");

                    b.HasIndex("CreatedById");

                    b.HasIndex("GridConfigurationId");

                    b.ToTable("DATA_IMPORT_HISTORIES");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.DataSourceConnection", b =>
                {
                    b.Property<string>("Name")
                        .HasColumnType("NVARCHAR2(450)")
                        .HasColumnName("NAME");

                    b.Property<string>("ConnectionString")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("CONNECTION_STRING");

                    b.HasKey("Name");

                    b.ToTable("DATA_SOURCE_CONNECTIONS");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.DemoTable", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("RAW(16)")
                        .HasColumnName("ID")
                        .HasDefaultValueSql("sys_guid()");

                    b.Property<bool>("Checked")
                        .HasColumnType("NUMBER(1)")
                        .HasColumnName("CHECKED");

                    b.Property<DateTime>("CreateDate")
                        .HasColumnType("TIMESTAMP(7)")
                        .HasColumnName("CREATE_DATE");

                    b.Property<string>("Division")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("DIVISION");

                    b.Property<string>("Employor")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("EMPLOYOR");

                    b.Property<string>("FirstName")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("FIRST_NAME");

                    b.Property<string>("Name")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("NAME");

                    b.Property<int>("Number")
                        .HasColumnType("NUMBER(10)")
                        .HasColumnName("NUMBER");

                    b.Property<decimal>("Total")
                        .HasColumnType("DECIMAL(18,2)")
                        .HasColumnName("TOTAL");

                    b.Property<string>("Vendor")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("VENDOR");

                    b.HasKey("Id");

                    b.ToTable("DEMO_TABLE");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.EventLog", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("RAW(16)")
                        .HasColumnName("ID");

                    b.Property<string>("Category")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("CATEGORY");

                    b.Property<string>("Details")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("DETAILS");

                    b.Property<string>("EventName")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("EVENT_NAME");

                    b.Property<string>("EventSection")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("EVENT_SECTION");

                    b.Property<DateTime>("EventTime")
                        .HasColumnType("TIMESTAMP(7)")
                        .HasColumnName("EVENT_TIME");

                    b.Property<string>("Params")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("PARAMS");

                    b.Property<string>("Result")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("RESULT");

                    b.Property<string>("Username")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("USERNAME");

                    b.HasKey("Id");

                    b.ToTable("EVENT_LOGS");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.DEMO_LINK_LOOKUP", b =>
                {
                    b.Property<string>("LOOKUPID")
                        .HasColumnType("NVARCHAR2(450)");

                    b.Property<string>("NAME5")
                        .HasColumnType("NVARCHAR2(2000)");

                    b.Property<string>("NAME4")
                        .HasColumnType("NVARCHAR2(2000)");

                    b.Property<string>("NAME1")
                        .HasColumnType("NVARCHAR2(2000)");

                    b.Property<string>("NAME6")
                        .HasColumnType("NVARCHAR2(2000)");

                    b.Property<string>("NAME3")
                        .HasColumnType("NVARCHAR2(2000)");

                    b.Property<string>("NAME2")
                        .HasColumnType("NVARCHAR2(2000)");

                    b.HasKey("LOOKUPID");

                    b.ToTable("DEMO_LINK_LOOKUP");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.DEMO_LINK_SECONDARY", b =>
                {
                    b.Property<int>("OBJECTID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("NUMBER(10)")
                        .HasAnnotation("Oracle:IdentityIncrement", 1)
                        .HasAnnotation("Oracle:IdentitySeed", 1)
                        .HasAnnotation("Oracle:ValueGenerationStrategy", OracleValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("ASSIGNEDTO")
                        .HasColumnType("NVARCHAR2(2000)");

                    b.Property<string>("BOUNDARYGLOBALID")
                        .HasColumnType("NVARCHAR2(2000)");

                    b.Property<string>("COMMENTS")
                        .HasColumnType("NVARCHAR2(2000)");

                    b.Property<string>("CREATIONUSER")
                        .HasColumnType("NVARCHAR2(2000)");

                    b.Property<DateTime?>("DATECREATED")
                        .HasColumnType("TIMESTAMP(7)");

                    b.Property<DateTime?>("DATEMODIFIED")
                        .HasColumnType("TIMESTAMP(7)");

                    b.Property<string>("EVENTID")
                        .HasColumnType("NVARCHAR2(2000)");

                    b.Property<string>("FEATUREGLOBALID")
                        .HasColumnType("NVARCHAR2(2000)");

                    b.Property<string>("GLOBALID")
                        .HasColumnType("NVARCHAR2(2000)");

                    b.Property<string>("LASTUSER")
                        .HasColumnType("NVARCHAR2(2000)");

                    b.Property<string>("STATUS1")
                        .HasColumnType("NVARCHAR2(2000)");

                    b.Property<DateTime?>("DATETIME4")
                        .HasColumnType("TIMESTAMP(7)");

                    b.Property<DateTime?>("DATETIME3")
                        .HasColumnType("TIMESTAMP(7)");

                    b.Property<string>("STATUS")
                        .HasColumnType("NVARCHAR2(2000)");

                    b.Property<string>("TYPE")
                        .HasColumnType("NVARCHAR2(2000)");

                    b.HasKey("OBJECTID");

                    b.ToTable("DEMO_LINK_SECONDARY");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.DEMO_LINK_PRIMARY", b =>
                {
                    b.Property<int>("OBJECTID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("NUMBER(10)")
                        .HasAnnotation("Oracle:IdentityIncrement", 1)
                        .HasAnnotation("Oracle:IdentitySeed", 1)
                        .HasAnnotation("Oracle:ValueGenerationStrategy", OracleValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("ASSESSEDBY")
                        .HasColumnType("NVARCHAR2(2000)");

                    b.Property<string>("BOUNDARYGLOBALID")
                        .HasColumnType("NVARCHAR2(2000)");

                    b.Property<string>("COMMENTS")
                        .HasColumnType("NVARCHAR2(2000)");

                    b.Property<string>("CREATIONUSER")
                        .HasColumnType("NVARCHAR2(2000)");

                    b.Property<string>("CRITERIA")
                        .HasColumnType("NVARCHAR2(2000)");

                    b.Property<DateTime?>("DATECREATED")
                        .HasColumnType("TIMESTAMP(7)");

                    b.Property<DateTime?>("DATEMODIFIED")
                        .HasColumnType("TIMESTAMP(7)");

                    b.Property<DateTime?>("DATETIME1")
                        .HasColumnType("TIMESTAMP(7)");

                    b.Property<string>("EVENTID")
                        .HasColumnType("NVARCHAR2(2000)");

                    b.Property<string>("FEATUREGLOBALID")
                        .HasColumnType("NVARCHAR2(2000)");

                    b.Property<string>("GLOBALID")
                        .HasColumnType("NVARCHAR2(2000)");

                    b.Property<string>("LASTUSER")
                        .HasColumnType("NVARCHAR2(2000)");

                    b.Property<string>("NAME")
                        .HasColumnType("NVARCHAR2(2000)");

                    b.Property<string>("STATUS1")
                        .HasColumnType("NVARCHAR2(2000)");

                    b.Property<DateTime?>("DATETIME4")
                        .HasColumnType("TIMESTAMP(7)");

                    b.Property<DateTime?>("DATETIME3")
                        .HasColumnType("TIMESTAMP(7)");

                    b.Property<DateTime?>("DATETIME2")
                        .HasColumnType("TIMESTAMP(7)");

                    b.Property<string>("STATUS")
                        .HasColumnType("NVARCHAR2(2000)");

                    b.Property<string>("TYPE")
                        .HasColumnType("NVARCHAR2(2000)");

                    b.HasKey("OBJECTID");

                    b.ToTable("DEMO_LINK_PRIMARY");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.DEMO_LINK_RELATION", b =>
                {
                    b.Property<int>("OBJECTID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("NUMBER(10)")
                        .HasAnnotation("Oracle:IdentityIncrement", 1)
                        .HasAnnotation("Oracle:IdentitySeed", 1)
                        .HasAnnotation("Oracle:ValueGenerationStrategy", OracleValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("LEFTID")
                        .HasColumnType("NUMBER(10)");

                    b.Property<int>("RIGHTID")
                        .HasColumnType("NUMBER(10)");

                    b.HasKey("OBJECTID");

                    b.ToTable("DEMO_LINK_RELATION");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.Lookup", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("RAW(16)")
                        .HasColumnName("ID");

                    b.Property<string>("DataSourceConnectionName")
                        .HasColumnType("NVARCHAR2(450)")
                        .HasColumnName("DATA_SOURCE_CONNECTION_NAME");

                    b.Property<string>("Name")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("NAME");

                    b.Property<string>("QueryText")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("QUERY_TEXT");

                    b.HasKey("Id");

                    b.HasIndex("DataSourceConnectionName");

                    b.ToTable("LOOKUPS");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.SiteContent", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("RAW(16)")
                        .HasColumnName("ID");

                    b.Property<string>("Content")
                        .HasColumnType("CLOB")
                        .HasColumnName("CONTENT");

                    b.Property<string>("ContentName")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("CONTENT_NAME");

                    b.HasKey("Id");

                    b.ToTable("SITE_CONTENTS");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.SiteMenu", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("RAW(16)")
                        .HasColumnName("ID");

                    b.Property<string>("Description")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("DESCRIPTION");

                    b.Property<string>("HelpUrl")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("HELP_URL");

                    b.Property<string>("Icon")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("ICON");

                    b.Property<string>("Label")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("LABEL");

                    b.Property<string>("Link")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("LINK");

                    b.Property<string>("Name")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("NAME");

                    b.Property<int>("Order")
                        .HasColumnType("NUMBER(10)")
                        .HasColumnName("ORDER");

                    b.Property<Guid?>("ParentId")
                        .HasColumnType("RAW(16)")
                        .HasColumnName("PARENT_ID");

                    b.Property<int>("Status")
                        .HasColumnType("NUMBER(10)")
                        .HasColumnName("STATUS");

                    b.Property<string>("Type")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("TYPE");

                    b.HasKey("Id");

                    b.HasIndex("ParentId");

                    b.ToTable("SITE_MENUS");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.SitePermission", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("RAW(16)")
                        .HasColumnName("ID");

                    b.Property<string>("Category")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("CATEGORY");

                    b.Property<string>("PermissionDescription")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("PERMISSION_DESCRIPTION");

                    b.Property<string>("PermissionName")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("PERMISSION_NAME");

                    b.HasKey("Id");

                    b.ToTable("SITE_PERMISSIONS");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.SiteRole", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("RAW(16)")
                        .HasColumnName("ID");

                    b.Property<string>("RoleDescription")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("ROLE_DESCRIPTION");

                    b.Property<string>("RoleName")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("ROLE_NAME");

                    b.HasKey("Id");

                    b.ToTable("SITE_ROLES");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.SiteRolePermission", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("RAW(16)")
                        .HasColumnName("ID");

                    b.Property<Guid>("CreatedBy")
                        .HasColumnType("RAW(16)")
                        .HasColumnName("CREATED_BY");

                    b.Property<DateTime>("CreatedDate")
                        .HasColumnType("TIMESTAMP(7)")
                        .HasColumnName("CREATED_DATE");

                    b.Property<Guid>("SitePermissionId")
                        .HasColumnType("RAW(16)")
                        .HasColumnName("SITE_PERMISSION_ID");

                    b.Property<Guid>("SiteRoleId")
                        .HasColumnType("RAW(16)")
                        .HasColumnName("SITE_ROLE_ID");

                    b.HasKey("Id");

                    b.HasIndex("SitePermissionId");

                    b.HasIndex("SiteRoleId")
                        .HasDatabaseName("IX_SITE_ROLE_PERMISSIONS_SIT~1");

                    b.ToTable("SITE_ROLE_PERMISSIONS");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.SiteSetting", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("RAW(16)")
                        .HasColumnName("ID");

                    b.Property<bool>("Installed")
                        .HasColumnType("NUMBER(1)")
                        .HasColumnName("INSTALLED");

                    b.Property<string>("License")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("LICENSE");

                    b.Property<string>("SiteLogo")
                        .HasColumnType("CLOB")
                        .HasColumnName("SITE_LOGO");

                    b.Property<string>("SiteName")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("SITE_NAME");

                    b.HasKey("Id");

                    b.ToTable("SITE_SETTINGS");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.UniversalGridConfiguration", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("RAW(16)")
                        .HasColumnName("ID");

                    b.Property<string>("ColumnsConfig")
                        .HasColumnType("CLOB")
                        .HasColumnName("COLUMNS_CONFIG");

                    b.Property<bool>("ConfigCompleted")
                        .HasColumnType("NUMBER(1)")
                        .HasColumnName("CONFIG_COMPLETED");

                    b.Property<Guid>("CreatedBy")
                        .HasColumnType("RAW(16)")
                        .HasColumnName("CREATED_BY");

                    b.Property<DateTime>("CreatedDate")
                        .HasColumnType("TIMESTAMP(7)")
                        .HasColumnName("CREATED_DATE");

                    b.Property<string>("CurrentStep")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("CURRENT_STEP");

                    b.Property<string>("CustomActionConfig")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("CUSTOMACTION_CONFIG");

                    b.Property<string>("DataSourceConfig")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("DATA_SOURCE_CONFIG");

                    b.Property<string>("DataSourceConnectionName")
                        .HasColumnType("NVARCHAR2(450)")
                        .HasColumnName("DATA_SOURCE_CONNECTION_NAME");

                    b.Property<string>("DetailConfig")
                        .HasColumnType("CLOB")
                        .HasColumnName("DETAIL_CONFIG");

                    b.Property<string>("ItemType")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("ITEM_TYPE");

                    b.Property<string>("Name")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("NAME");

                    b.Property<string>("SearchConfig")
                        .HasColumnType("CLOB")
                        .HasColumnName("SEARCH_CONFIG");

                    b.HasKey("Id");

                    b.HasIndex("DataSourceConnectionName");

                    b.ToTable("UNIVERSAL_GRID_CONFIGURATIONS");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.UploadedFile", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("NVARCHAR2(450)")
                        .HasColumnName("ID");

                    b.Property<string>("Comments")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("COMMENTS");

                    b.Property<string>("ContentType")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("CONTENT_TYPE");

                    b.Property<string>("DataId")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("DATA_ID");

                    b.Property<byte[]>("FileBytes")
                        .HasColumnType("BLOB")
                        .HasColumnName("FILE_BYTES");

                    b.Property<string>("FileName")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("FILE_NAME");

                    b.Property<string>("FilePath")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("FILE_PATH");

                    b.Property<string>("Status")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("STATUS");

                    b.HasKey("Id");

                    b.ToTable("UPLOADED_FILE");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.User", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("RAW(16)")
                        .HasColumnName("ID")
                        .HasDefaultValueSql("sys_guid()");

                    b.Property<bool>("AutoEmail")
                        .HasColumnType("NUMBER(1)")
                        .HasColumnName("AUTO_EMAIL");

                    b.Property<string>("Comments")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("COMMENTS");

                    b.Property<string>("Email")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("EMAIL");

                    b.Property<string>("Employer")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("EMPLOYER");

                    b.Property<string>("Name")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("NAME");

                    b.Property<string>("Phone")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("PHONE");

                    b.Property<int>("UserId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("NUMBER(10)")
                        .HasColumnName("USER_ID")
                        .HasAnnotation("Oracle:IdentityIncrement", 1)
                        .HasAnnotation("Oracle:IdentitySeed", 1)
                        .HasAnnotation("Oracle:ValueGenerationStrategy", OracleValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("UserType")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("USER_TYPE");

                    b.Property<string>("Username")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("USERNAME");

                    b.Property<string>("Vendor")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("VENDOR");

                    b.HasKey("Id");

                    b.ToTable("USERS");
                });

            modelBuilder.Entity("DataEditorPortal.Data.Models.UserPermission", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("RAW(16)")
                        .HasColumnName("ID");

                    b.Property<Guid>("CreatedBy")
                        .HasColumnType("RAW(16)")
                        .HasColumnName("CREATED_BY");

                    b.Property<DateTime>("CreatedDate")
                        .HasColumnType("TIMESTAMP(7)")
                        .HasColumnName("CREATED_DATE");

                    b.Property<string>("GrantType")
                        .HasColumnType("NVARCHAR2(2000)")
                        .HasColumnName("GRANT_TYPE");

                    b.Property<Guid>("PermissionGrantId")
                        .HasColumnType("RAW(16)")
                        .HasColumnName("PERMISSION_GRANT_ID");

                    b.Property<Guid>("UserId")
                        .HasColumnType("RAW(16)")
                        .HasColumnName("USER_ID");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("USER_PERMISSIONS");
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
                        .HasConstraintName("FK_SITE_ROLE_PERMISSIONS_SIT~1")
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

            modelBuilder.Entity("DataEditorPortal.Data.Models.DataSourceConnection", b =>
                {
                    b.Navigation("UniversalGridConfigurations");
                });
#pragma warning restore 612, 618
        }
    }
}
