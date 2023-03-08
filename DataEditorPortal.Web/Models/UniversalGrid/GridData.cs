using System.Collections.Generic;

namespace DataEditorPortal.Web.Models.UniversalGrid
{
    public class GridData
    {
        public List<Dictionary<string, dynamic>> Data { get; set; } = new List<Dictionary<string, dynamic>>();
        public int Total { get; set; }
    }
}
