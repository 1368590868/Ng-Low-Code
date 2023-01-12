using System.Collections.Generic;

namespace DataEditorPortal.Web.Models.UniversalGrid
{
    public class GridData
    {
        public List<Dictionary<string, string>> Data { get; set; } = new List<Dictionary<string, string>>();
        public int Total { get; set; }
    }
}
