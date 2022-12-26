using System;
using System.ComponentModel.DataAnnotations;

namespace DataEditorPortal.Data.Models
{
    public class SitePermission
    {
        [Key]
        public Guid Id { get; set; }
        public string PermissionName { get; set; }
        public string PermissionDescription { get; set; }
        public bool IsDefaultGranted { get; set; }
        public string Category { get; set; }
    }
}
