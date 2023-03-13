using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataEditorPortal.Data.Models
{
    [Table("SITE_ROLES")]
    public class SiteRole
    {
        [Key]
        [Column("ID")]
        public Guid Id { get; set; }
        [Column("ROLE_NAME")]
        public string RoleName { get; set; }
        [Column("ROLE_DESCRIPTION")]
        public string RoleDescription { get; set; }
    }
}
