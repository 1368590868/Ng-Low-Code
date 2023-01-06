using System.Collections.Generic;

namespace DataEditorPortal.Web.Models.UniversalGrid
{

    public class GridParam
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string WorkType { get; set; }

        public Dictionary<string, object> Searches { get; set; } = new Dictionary<string, object>();
        public List<FilterParam> Filters { get; set; } = new List<FilterParam>();
        public List<SortParam> Sorts { get; set; } = new List<SortParam>();

        public int StartIndex { get; set; }
        public int IndexCount { get; set; }

        public string AppendFilter { get; set; }

        //public List<GridColConfig> GridColumns { get; set; } = new List<GridColConfig>();
        //public List<string> SelectedIDs { get; set; }
    }

    public class FilterParam
    {
        public string field { get; set; }
        public string matchMode { get; set; }
        public string Operator { get; set; }
        public object value { get; set; }
        public string dBFieldExpression { get; set; }
    }

    public class SortParam
    {
        public string field { get; set; }
        public int order { get; set; }
        public string dBFieldExpression { get; set; }
    }

    public class SearchParam : FilterParam
    {
        public string whereClause { get; set; }
    }
}
