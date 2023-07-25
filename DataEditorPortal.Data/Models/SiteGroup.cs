using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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
        [Column("Title")]
        public string Title { get; set; }
        [Column("DESCRIPTION")]
        public string Description { get; set; }

        public virtual ICollection<SiteMenu> SiteMenus { get; set; }

    }
}
