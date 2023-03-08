using System;

namespace DataEditorPortal.Web.Models
{
    public class LookupItem
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string QueryText { get; set; }
        public Guid ConnectionId { get; set; }
    }
}