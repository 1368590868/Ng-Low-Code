using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataEditorPortal.Data.Models
{
    [Table("LOOKUPS")]
    public class Lookup
    {
        [Key]
        [Column("ID")]
        public Guid Id { get; set; }
        [Column("NAME")]
        public string Name { get; set; }
        [Column("QUERY_TEXT")]
        public string QueryText { get; set; }
        [Column("DATA_SOURCE_CONNECTION_ID")]
        public Guid DataSourceConnectionId { get; set; }
        public virtual DataSourceConnection DataSourceConnection { get; set; }
    }
}
