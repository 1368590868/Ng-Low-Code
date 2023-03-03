using System;
using System.ComponentModel.DataAnnotations;

namespace DataEditorPortal.Data.Models
{
    public class Lookup
    {
        [Key]
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string QueryText { get; set; }
        public Guid DataSourceConnectionId { get; set; }
        public virtual DataSourceConnection DataSourceConnection { get; set; }
    }
}
