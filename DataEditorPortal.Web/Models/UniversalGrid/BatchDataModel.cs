using System.Collections.Generic;

namespace DataEditorPortal.Web.Models.UniversalGrid
{
    public class BatchGetInput
    {
        public string[] Ids { get; set; }
    }

    public class BatchUpdateInput
    {
        public Dictionary<string, object> Data { get; set; }
        public string[] Ids { get; set; }
    }
}
