using System.Collections.Generic;

namespace DataEditorPortal.Web.Models.UniversalGrid
{
    public class GridConfig
    {
        public string Name { get; set; }

        public string Caption { get; set; }
        public string Description { get; set; }
        public string DataKey { get; set; }

        public bool AllowExport { get; set; } = true;
        public bool AllowDelete { get; set; } = true;
        public bool AllowEdit { get; set; } = true;
        public bool UseCustomForm { get; set; }
        public string CustomAddFormName { get; set; }
        public string CustomEditFormName { get; set; }
        public string CustomViewFormName { get; set; }

        public List<CustomAction> CustomActions { get; set; }
    }

    public class FormFieldConfig
    {
        public string filterType { get; set; }
        public string key { get; set; }
        public string type { get; set; }
        public object defaultValue { get; set; }
        public object props { get; set; }
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

        public bool sortable { get; set; }

        //public int order { get; set; }

        //public bool aggregate { get; set; } = false;
    }

    public class DataSourceConfig
    {
        public string TableName { get; set; }
        public string TableSchema { get; set; }
        public string IdColumn { get; set; }
        public List<string> Columns { get; set; } = new List<string>();
        public List<SortParam> SortBy { get; set; } = new List<SortParam>();
        public List<FilterParam> Filters { get; set; } = new List<FilterParam>();

        public string QueryText { get; set; }
    }

    public class DetailConfig
    {
        public bool AllowExport { get; set; } = true;
        public bool AllowDelete { get; set; } = true;
        public bool AllowEdit { get; set; } = true;
        public bool UseCustomForm { get; set; }
        public string CustomAddFormName { get; set; }
        public string CustomEditFormName { get; set; }
        public string CustomViewFormName { get; set; }

        public List<FormFieldConfig> FormFields { get; set; }

        public string QueryText { get; set; }
        public string QueryForInsert { get; set; }
        public string QueryForUpdate { get; set; }
        public string QueryForDelete { get; set; }
    }

    public class CustomAction
    {
        public string Name { get; set; }
    }
}
