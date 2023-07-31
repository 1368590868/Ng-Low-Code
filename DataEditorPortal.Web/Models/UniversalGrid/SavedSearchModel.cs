using System;
using System.Collections.Generic;

namespace DataEditorPortal.Web.Models.UniversalGrid
{
    public class SavedSearchModel
    {
        public Guid? Id { get; set; }
        public string Name { get; set; }
        public Dictionary<string, object> Searches { get; set; } = new Dictionary<string, object>();
    }
}
