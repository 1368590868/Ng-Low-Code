using System;
using System.ComponentModel.DataAnnotations;

namespace DataEditorPortal.Data.Models
{
    public class UserPermission
    {
        [Key]
        public Guid Id { get; set; }
        public virtual User User { get; set; }
        public virtual Guid UserId { get; set; }
        public Guid PermissionGrantId { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string GrantType { get; set; }
    }
}
