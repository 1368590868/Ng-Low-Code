using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataEditorPortal.Data.Models
{
    [Table("SITE_SETTINGS")]
    public class SiteSetting
    {
        [Key]
        [Column("ID")]
        public Guid Id { get; set; }
        [Column("SITE_NAME")]
        public string SiteName { get; set; }
        [Column("SITE_LOGO")]
        public string SiteLogo { get; set; }

        [Column("LICENSE")]
        public string License { get; set; }

        [Column("INSTALLED")]
        public bool Installed { get; set; }
    }
}
