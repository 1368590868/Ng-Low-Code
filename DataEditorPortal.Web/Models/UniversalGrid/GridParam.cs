using System.Collections.Generic;

namespace DataEditorPortal.Web.Models.UniversalGrid
{

    public class GridParam
    {
        public Dictionary<string, object> Searches { get; set; } = new Dictionary<string, object>();
        public List<FilterParam> Filters { get; set; } = new List<FilterParam>();
        public List<SortParam> Sorts { get; set; } = new List<SortParam>();

        public int StartIndex { get; set; }
        public int IndexCount { get; set; }
    }

    public class ExportParam : GridParam
    {
        public string FileName { get; set; }
        public List<string> SelectedIDs { get; set; }
    }

    public class FilterParam
    {
        public string field { get; set; }
        public string matchMode { get; set; }
        public string filterType { get; set; }
        public object value { get; set; }
        public string whereClause { get; set; }
        public int index { get; set; }
    }

    public class SortParam
    {
        public string field { get; set; }
        public int order { get; set; }
    }

    public class BatchDeleteParam
    {
        public object[] Ids { get; set; }
    }
}
