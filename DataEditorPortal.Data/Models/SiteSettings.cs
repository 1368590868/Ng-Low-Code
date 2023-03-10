using System;
using System.ComponentModel.DataAnnotations;

namespace DataEditorPortal.Data.Models
{
    public class SiteSetting
    {
        [Key]
        public Guid Id { get; set; }
        public string SiteName { get; set; }
        public string SiteLogo { get; set; }
        public bool Installed { get; set; }
    }
}
