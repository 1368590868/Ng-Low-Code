using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Xml.Serialization;

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
        [Column("DATA_SOURCE_CONNECTION_NAME")]
        public string DataSourceConnectionName { get; set; }
        [XmlIgnore]
        public virtual DataSourceConnection DataSourceConnection { get; set; }

        [Column("UNIVERSAL_GRID_CONFIG_ID")]
        public Guid? UniversalGridConfigurationId { get; set; }
    }
}
