using System;
using System.ComponentModel.DataAnnotations;

namespace DataEditorPortal.Data.Models
{
    public class UniversalGridConfiguration
    {
        [Key]
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Icon { get; set; }

        public string DataSourceConfig { get; set; }

        public string ColumnsConfig { get; set; }

        public string SearchConfig { get; set; }

        public bool UseCustomDetailDialog { get; set; }
        public string DetailDialogConfig { get; set; }

        public Guid CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}
