using System;
using System.ComponentModel.DataAnnotations;

namespace DataEditorPortal.Data.Models
{
    public class SiteMenu
    {
        [Key]
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Label { get; set; }
        public string Description { get; set; }
        public string Icon { get; set; }
        public string Type { get; set; }
        public int Order { get; set; }

        public SiteMenu Parent { get; set; }
        public Guid? ParentId { get; set; }
    }
}
