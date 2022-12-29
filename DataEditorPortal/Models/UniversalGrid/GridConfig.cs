using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;

namespace DataEditorPortal.Web.Models.UniversalGrid
{
    public class GridConfig
    {
        public string Name { get; set; }

        public string Description { get; set; }

        public string ListQuery { get; set; }

        public string DetailsQuery { get; set; }

        public List<GridColConfig> Columns { get; set; } = new List<GridColConfig>();

        public List<SearchConfig> SearchConfig { get; set; } = new List<SearchConfig>();
    }

    public class SearchConfig
    {
        // basic info
        public string Key { get; set; }
        public string Type { get; set; }
        public JObject Props { get; set; }

        // advance field dependence
        public string DependOnFields { get; set; }

        // search rule
        [JsonIgnore]
        public SearchFiledFilterRule SearchRule { get; set; }
    }

    public class SearchFiledFilterRule
    {
        public string FieldType { get; set; } // Database, SearchField
        public string Field { get; set; }
        public string MatchMode { get; set; }
        public string WhereClause { get; set; }
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
}
