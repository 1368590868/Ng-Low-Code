using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataEditorPortal.Data.Models
{
    [Table("SITE_CONTENTS")]
    public class SiteContent
    {
        [Key]
        [Column("ID")]
        public Guid Id { get; set; }
        [Column("CONTENT_NAME")]
        public string ContentName { get; set; }
        [Column("CONTENT")]
        public string Content { get; set; }

        [Column("SITE_GROUP_ID")]
        public Guid? SiteGroupId { get; set; }
    }
}
