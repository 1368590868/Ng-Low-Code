using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataEditorPortal.Data.Models
{
    [Table("USERS")]
    public class User
    {
        [Key]
        [Column("ID")]
        public Guid Id { get; set; }
        [Column("USER_ID")]
        public int UserId { get; set; }
        [Column("USERNAME")]
        public string Username { get; set; }
        [Column("EMPLOYER")]
        public string Employer { get; set; }
        [Column("COMMENTS")]
        public string Comments { get; set; }
        [Column("NAME")]
        public string Name { get; set; }
        [Column("EMAIL")]
        public string Email { get; set; }
        [Column("VENDOR")]
        public string Vendor { get; set; }
        [Column("AUTO_EMAIL")]
        public bool AutoEmail { get; set; }
        [Column("USER_TYPE")]
        public string UserType { get; set; }
        [Column("PHONE")]
        public string Phone { get; set; }
    }
}
