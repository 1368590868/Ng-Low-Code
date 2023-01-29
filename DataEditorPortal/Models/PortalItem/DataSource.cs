using System;
using System.Text.Json.Serialization;

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

        [JsonIgnore]
        public Type DataType { get; set; }
        public string FilterType
        {
            get
            {
                if (DataType == typeof(int) || DataType == typeof(long) || DataType == typeof(short) ||
                    DataType == typeof(float) || DataType == typeof(decimal) || DataType == typeof(double))
                    return "numeric";
                if (DataType == typeof(DateTime))
                    return "date";
                if (DataType == typeof(bool))
                    return "boolean";
                return "text";
            }
        }
    }
}
