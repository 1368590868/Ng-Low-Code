using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataEditorPortal.Data.Models
{
    [Table("USER_PERMISSIONS")]
    public class UserPermission
    {
        [Key]
        [Column("ID")]
        public Guid Id { get; set; }
        public virtual User User { get; set; }
        [Column("USER_ID")]
        public virtual Guid UserId { get; set; }
        [Column("PERMISSION_GRANT_ID")]
        public Guid PermissionGrantId { get; set; }
        [Column("CREATED_BY")]
        public Guid CreatedBy { get; set; }
        [Column("CREATED_DATE")]
        public DateTime CreatedDate { get; set; }
        [Column("GRANT_TYPE")]
        public string GrantType { get; set; }
    }
}
