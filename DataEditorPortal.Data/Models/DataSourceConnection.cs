using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataEditorPortal.Data.Models
{
    [Table("DATA_SOURCE_CONNECTIONS")]
    public class DataSourceConnection
    {
        [Key]
        [Column("NAME")]
        public string Name { get; set; }
        [Column("CONNECTION_STRING")]
        public string ConnectionString { get; set; }

        public virtual ICollection<UniversalGridConfiguration> UniversalGridConfigurations { get; set; }

        [NotMapped]
        public int UsedCount { get; set; }
    }
}
