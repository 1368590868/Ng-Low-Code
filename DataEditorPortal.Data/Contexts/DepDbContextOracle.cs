﻿using DataEditorPortal.Data.Common;
using DataEditorPortal.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace DataEditorPortal.Data.Contexts
{
    public class DepDbContextOracle : DepDbContext
    {
        public DepDbContextOracle(DbContextOptions<DepDbContext> options) : base(options)
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
            });
        }
    }
}