using System;
using System.ComponentModel.DataAnnotations;

namespace DataEditorPortal.Data.Models
{
    public class User
    {
        [Key]
        public Guid Id { get; set; }
        public string Username { get; set; }
        public string Employer { get; set; }
        public string Comments { get; set; }
        public string Division { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Vendor { get; set; }
        public bool AutoEmail { get; set; }
        public string UserType { get; set; }
        public string Phone { get; set; }
    }
}
