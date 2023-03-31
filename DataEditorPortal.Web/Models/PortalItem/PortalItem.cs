using DataEditorPortal.Data.Common;
using System;
using System.Collections.Generic;

namespace DataEditorPortal.Web.Models.PortalItem
{
    public class PortalItem
    {
        public PortalItemData Data { get; set; }
        public List<PortalItem> Children { get; set; }
    }

    public class PortalItemData
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Label { get; set; }
        public string Icon { get; set; }
        public string Link { get; set; }
        public string Description { get; set; }
        public string HelpUrl { get; set; }
        public string Type { get; set; }
        public int Order { get; set; }
        public Guid? ParentId { get; set; }
        public PortalItemStatus Status { get; set; }
        public bool? ConfigCompleted { get; set; }
        public string CurrentStep { get; set; }
        public string ItemType { get; set; }
    }
}
