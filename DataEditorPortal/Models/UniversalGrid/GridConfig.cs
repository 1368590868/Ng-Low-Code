using System.Collections.Generic;

namespace DataEditorPortal.Web.Models.UniversalGrid
{
    public class GridConfig
    {
        public string Name { get; set; }

        public string Description { get; set; }

        public string ListQuery { get; set; }

        public string DetailsQuery { get; set; }

        public List<GridColConfig> Columns { get; set; }

        public List<SearchConfig> SearchConfig { get; set; }
    }

    public class SearchConfig
    {
        public string Name { get; set; }
        public string Label { get; set; }
        public string WhereClause { get; set; }
        public string WhereClause2 { get; set; }

        public string HelpTip { get; set; }

        public bool ExcludeFromWhereClause { get; set; } = false;
        public string Type { get; set; }

        public string OptionConfig { get; set; }
        public string OptionLabel { get; set; }
        public string OptionValue { get; set; }
        public string OptionType { get; set; }

        public string Type2 { get; set; }
        public string Label2 { get; set; }
        public bool ToggleOn { get; set; } = false;
        public List<object> Options { get; set; }
        public string SelectedValue { get; set; }
        public string ToggleValue { get; set; } = "";

        public string DefaultValue { get; set; }
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
        public List<string> Columns { get; set; }
        public List<SortParam> SortBy { get; set; }
        public List<FilterParam> Filters { get; set; }

        public string QueryText { get; set; }
    }
}
