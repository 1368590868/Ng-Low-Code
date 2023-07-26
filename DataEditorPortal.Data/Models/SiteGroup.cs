using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace DataEditorPortal.Data.Models
{
    [Table("SITE_GROUPS")]
    public class SiteGroup
    {
        [Key]
        [Column("ID")]
        public Guid Id { get; set; }
        [Column("NAME")]
        public string Name { get; set; }
        [Column("TITLE")]
        public string Title { get; set; }
        [Column("DESCRIPTION")]
        public string Description { get; set; }

        [JsonIgnore]
        public virtual ICollection<SiteMenu> SiteMenus { get; set; }

    }
}
