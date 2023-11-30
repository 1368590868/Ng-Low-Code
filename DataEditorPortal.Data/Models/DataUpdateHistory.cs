using DataEditorPortal.Data.Common;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataEditorPortal.Data.Models
{
    [Table("DATA_UPDATE_HISTORIES")]
    public class DataUpdateHistory
    {
        [Key]
        [Column("ID")]
        public Guid Id { get; set; }
        [Column("CREATE_DATE")]
        public DateTime CreateDate { get; set; }
        [Column("USERNAME")]
        public string Username { get; set; }
        [Column("GRID_CONFIG_ID")]
        public string GridConfigurationId { get; set; }
        [Column("DATA_ID")]
        public string DataId { get; set; }

        [Column("FIELD")]
        public string Field { get; set; }
        [Column("ORIGINAL_VALUE")]
        public string OriginalValue { get; set; }
        [Column("NEW_VALUE")]
        public string NewValue { get; set; }

        [Column("ACTION_TYPE")]
        public ActionType ActionType { get; set; }
    }
}
