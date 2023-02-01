using System;
using System.ComponentModel.DataAnnotations;

namespace DataEditorPortal.Data.Models
{
    public class UniversalGridConfiguration
    {
        [Key]
        public Guid Id { get; set; }
        public string Name { get; set; }

        public string CurrentStep { get; set; }

        public bool ConfigCompleted { get; set; }

        public string DataSourceConfig { get; set; }

        public string ColumnsConfig { get; set; }

        public string SearchConfig { get; set; }

        public string DetailConfig { get; set; }

        public Guid CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}
