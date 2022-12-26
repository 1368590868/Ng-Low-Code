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
        public string field { get; set; }
        public string matchMode { get; set; }
        public string Operator { get; set; }
        public object value { get; set; }
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
}
