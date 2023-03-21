﻿using DataEditorPortal.Data.Common;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataEditorPortal.Data.Models
{
    [Table("SITE_MENUS")]
    public class SiteMenu
    {
        [Key]
        [Column("ID")]
        public Guid Id { get; set; }
        [Column("NAME")]
        public string Name { get; set; }
        [Column("LABEL")]
        public string Label { get; set; }
        [Column("DESCRIPTION")]
        public string Description { get; set; }
        [Column("HELP_URL")]
        public string HelpUrl { get; set; }
        [Column("ICON")]
        public string Icon { get; set; }
        [Column("TYPE")]
        public string Type { get; set; }
        [Column("LINK")]
        public string Link { get; set; }
        [Column("ORDER")]
        public int Order { get; set; }
        [Column("STATUS")]
        public PortalItemStatus Status { get; set; }

        public SiteMenu Parent { get; set; }
        [Column("PARENT_ID")]
        public Guid? ParentId { get; set; }
    }
}
