using System.Collections.Generic;

namespace DataEditorPortal.Web.Models.UniversalGrid
{
    public class GridData
    {
        public List<IDictionary<string, object>> Data { get; set; } = new List<IDictionary<string, object>>();
        public int Total { get; set; }
    }
}
