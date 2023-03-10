using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataEditorPortal.Data.Models
{
    [Table("SITE_PERMISSIONS")]
    public class SitePermission
    {
        [Key]
        [Column("ID")]
        public Guid Id { get; set; }
        [Column("PERMISSION_NAME")]
        public string PermissionName { get; set; }
        [Column("PERMISSION_DESCRIPTION")]
        public string PermissionDescription { get; set; }
        //public bool IsDefaultGranted { get; set; }
        [Column("CATEGORY")]
        public string Category { get; set; }
    }
}
