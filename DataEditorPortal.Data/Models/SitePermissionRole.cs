using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataEditorPortal.Data.Models
{
    [Table("SITE_ROLE_PERMISSIONS")]
    public class SiteRolePermission
    {
        [Key]
        [Column("ID")]
        public Guid Id { get; set; }
        public virtual SitePermission SitePermission { get; set; }
        [Column("SITE_PERMISSION_ID")]
        public virtual Guid SitePermissionId { get; set; }
        public virtual SiteRole SiteRole { get; set; }
        [Column("SITE_ROLE_ID")]
        public virtual Guid SiteRoleId { get; set; }
        [Column("CREATED_BY")]
        public Guid CreatedBy { get; set; }
        [Column("CREATED_DATE")]
        public DateTime CreatedDate { get; set; }
    }
}
