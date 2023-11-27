using DataEditorPortal.Data.Common;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataEditorPortal.Data.Models
{
    [Table("DATA_IMPORT_HISTORIES")]
    public class DataImportHistory
    {
        [Key]
        [Column("ID")]
        public Guid Id { get; set; }

        [Column("NAME")]
        public string Name { get; set; }
        [Column("IMPORT_TYPE")]
        public ActionType ImportType { get; set; }

        [Column("GRID_COINFG_ID")]
        public Guid GridConfigurationId { get; set; }
        public virtual UniversalGridConfiguration GridConfiguration { get; set; }

        [Column("STATUS")]
        public DataImportResult Status { get; set; }

        [Column("RESULT")]
        public string Result { get; set; }

        [Column("CREATED_BY")]
        public Guid CreatedById { get; set; }

        public virtual User CreatedBy { get; set; }

        [Column("CREATED_DATE")]
        public DateTime CreatedDate { get; set; }
    }
}
