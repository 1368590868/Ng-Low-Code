using System.Collections.Generic;

namespace DataEditorPortal.Web.Models.UniversalGrid
{
    public class GridConfig
    {
        public string Name { get; set; }

        public string Caption { get; set; }
        public string Description { get; set; }
        public string DataKey { get; set; }
    }

    public class FormFieldConfig
    {
        public string key { get; set; }
        public string type { get; set; }
        public object defaultValue { get; set; }
        public object props { get; set; }

        // advance field dependence
        public string dependOnFields { get; set; }
    }
    public class SearchFieldConfig : FormFieldConfig
    {
        // search rule
        public SearchFieldFilterRule searchRule { get; set; }
    }

    public class SearchFieldFilterRule
    {
        public string dBFieldExpression { get; set; } // Database, SearchField
        public string field { get; set; }
        public string matchMode { get; set; }
        public string whereClause { get; set; }
    }

    public class GridColConfig
    {
        public string field { get; set; }
        public string header { get; set; }
        public string width { get; set; }
        public string filterType { get; set; }

        public string UIType { get; set; }

        public int order { get; set; }

        public bool aggregate { get; set; } = false;
    }

    public class DataSourceConfig
    {
        public string TableName { get; set; }
        public string IdColumn { get; set; }
        public List<string> Columns { get; set; } = new List<string>();
        public List<SortParam> SortBy { get; set; } = new List<SortParam>();
        public List<FilterParam> Filters { get; set; } = new List<FilterParam>();

        public string QueryText { get; set; }
    }

    public class DetailConfig
    {
        public bool UseCustomAction { get; set; }
        public string CustomActionName { get; set; }
        public List<FormFieldConfig> FormConfig { get; set; }

        public string QueryText { get; set; }
        public string QueryForInsert { get; set; }
        public string QueryForUpdate { get; set; }
        public string QueryForDelete { get; set; }
    }
}
