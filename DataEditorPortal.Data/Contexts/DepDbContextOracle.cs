﻿using DataEditorPortal.Data.Common;
using DataEditorPortal.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace DataEditorPortal.Data.Contexts
{
    public class DepDbContextOracle : DepDbContext
    {
        public DepDbContextOracle(DbContextOptions<DepDbContext> options, IUtcLocalConverter utcLocalConverter) : base(options, utcLocalConverter)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Model.SetMaxIdentifierLength(30);

            modelBuilder.HasDefaultSchema(Constants.DEFAULT_SCHEMA);

            modelBuilder.Entity<User>(entity =>
            {
                entity.Property(e => e.Id).HasDefaultValueSql("sys_guid()");
                OraclePropertyBuilderExtensions.UseIdentityColumn(entity.Property(e => e.UserId));
            });

            modelBuilder.Entity<DemoTable>(entity =>
            {
                entity.Property(e => e.Id).HasDefaultValueSql("sys_guid()");
                entity.Property(e => e.Total).HasColumnType("DECIMAL(18,2)");
            });

            modelBuilder.Entity<UniversalGridConfiguration>(entity =>
            {
                entity.Property(e => e.ColumnsConfig).HasColumnType("CLOB");
                entity.Property(e => e.SearchConfig).HasColumnType("CLOB");
                entity.Property(e => e.DetailConfig).HasColumnType("CLOB");
            });

            modelBuilder.Entity<EventLog>(entity =>
            {
                entity.Property(e => e.Details).HasColumnType("CLOB");
                entity.Property(e => e.Params).HasColumnType("CLOB");
            });

            modelBuilder.Entity<SavedSearch>(entity =>
            {
                entity.Property(e => e.SearchParams).HasColumnType("CLOB");
            });

            modelBuilder.Entity<SiteSetting>(entity =>
            {
                entity.Property(e => e.SiteLogo).HasColumnType("CLOB");
            });

            modelBuilder.Entity<SiteContent>(entity =>
            {
                entity.Property(e => e.Content).HasColumnType("CLOB");
            });

            modelBuilder.Entity<UploadedFile>(entity =>
            {
                entity.Property(e => e.FileBytes).HasColumnType("BLOB");
            });


            modelBuilder.Entity<DEMO_LINK_PRIMARY>(entity =>
            {
                OraclePropertyBuilderExtensions.UseIdentityColumn(entity.Property(e => e.OBJECTID));
            });
            modelBuilder.Entity<DEMO_LINK_SECONDARY>(entity =>
            {
                OraclePropertyBuilderExtensions.UseIdentityColumn(entity.Property(e => e.OBJECTID));
            });
            modelBuilder.Entity<DEMO_LINK_RELATION>(entity =>
            {
                OraclePropertyBuilderExtensions.UseIdentityColumn(entity.Property(e => e.OBJECTID));
            });
        }
    }
}
