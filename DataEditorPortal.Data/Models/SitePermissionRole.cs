using System;
using System.ComponentModel.DataAnnotations;

namespace DataEditorPortal.Data.Models
{
    public class SitePermissionRole
    {
        [Key]
        public Guid Id { get; set; }
        public virtual SitePermission SitePermission { get; set; }
        public virtual Guid SitePermissionId { get; set; }
        public virtual SiteRole SiteRole { get; set; }
        public virtual Guid SiteRoleId { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}
