using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataEditorPortal.Data.Models
{
    public class DataSourceConnection
    {
        [Key]
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string ConnectionString { get; set; }

        public virtual ICollection<UniversalGridConfiguration> UniversalGridConfigurations { get; set; }

        [NotMapped]
        public int UsedCount { get; set; }
    }
}
