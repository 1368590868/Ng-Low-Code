namespace DataEditorPortal.Web.Models.PortalItem
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
}
