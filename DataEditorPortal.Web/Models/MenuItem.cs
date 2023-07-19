using DataEditorPortal.Data.Common;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace DataEditorPortal.Web.Models
{
    public class MenuItem
    {
        public Guid Id { get; set; }
        public Guid? ParentId { get; set; }
        public string Name { get; set; }
        public string Label { get; set; }
        public string Icon { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public int Order { get; set; }
        [JsonIgnore]
        public string Link { get; set; }
        public string Url { get; set; }
        public string RouterLink { get; set; }
        public string ItemType { get; set; }
        public PortalItemStatus Status { get; set; }
        public string Component { get; set; }
        public bool RequireAuth { get; set; }
        public bool RequireAdmin { get; set; }
        public List<MenuItem> Items { get; set; }
    }
}
