using System;
using System.Collections.Generic;

namespace DataEditorPortal.Web.Models
{
    public class PermissionNode
    {
        public string Label { get; set; }
        public string Name { get; set; }
        public Guid Key { get; set; }
        public string Icon { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public bool Selected { get; set; }
        public bool PartialSelected { get; set; }
        public bool Expanded { get; set; }
        public List<PermissionNode> Children { get; set; }
    }
}
