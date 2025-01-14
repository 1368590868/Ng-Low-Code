﻿namespace DataEditorPortal.Web.Models.PortalItem
{
    public class DataSourceTable
    {
        public string TableName { get; set; }
        public string TableSchema { get; set; }
    }

    public class DataSourceTableColumn
    {
        public string ColumnName { get; set; }
        public bool IsUnique { get; set; }
        public bool IsKey { get; set; }
        public bool IsAutoIncrement { get; set; }
        public bool IsIdentity { get; set; }
        public bool AllowDBNull { get; set; }
        public string FilterType { get; set; }
    }

    public class DataSourceConnectionModel
    {
        public string Name { get; set; }
        public string ServerName { get; set; }
        public string Authentication { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string DbName { get; set; }
        public int UsedCount { get; set; }
        public string ConnectionString { get; set; }
        public string IncludeSchemas { get; set; }
        public string TableNameRule { get; set; }
    }
}
