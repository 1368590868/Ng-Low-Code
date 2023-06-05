using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataEditorPortal.Data.Models
{
    [Table("UNIVERSAL_GRID_CONFIGURATIONS")]
    public class UniversalGridConfiguration
    {
        [Key]
        [Column("ID")]
        public Guid Id { get; set; }
        [Column("NAME")]
        public string Name { get; set; }
        [Column("ITEM_TYPE")]
        public string ItemType { get; set; }
        [Column("CURRENT_STEP")]
        public string CurrentStep { get; set; }
        [Column("CONFIG_COMPLETED")]
        public bool ConfigCompleted { get; set; }
        [Column("DATA_SOURCE_CONFIG")]
        public string DataSourceConfig { get; set; }
        [Column("COLUMNS_CONFIG")]
        public string ColumnsConfig { get; set; }
        [Column("SEARCH_CONFIG")]
        public string SearchConfig { get; set; }
        [Column("DETAIL_CONFIG")]
        public string DetailConfig { get; set; }
        [Column("CUSTOMACTION_CONFIG")]
        public string CustomActionConfig { get; set; }
        [Column("CREATED_BY")]
        public Guid CreatedBy { get; set; }
        [Column("CREATED_DATE")]
        public DateTime CreatedDate { get; set; }
        [Column("DATA_SOURCE_CONNECTION_NAME")]
        public string DataSourceConnectionName { get; set; }
        public virtual DataSourceConnection DataSourceConnection { get; set; }
    }
}
