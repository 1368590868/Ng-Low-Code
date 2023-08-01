using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataEditorPortal.Data.Models
{
    [Table("SAVED_SEARCHES")]
    public class SavedSearch
    {
        [Key]
        [Column("ID")]
        public Guid Id { get; set; }
        [Column("NAME")]
        public string Name { get; set; }
        [Column("SEARCH_PARAMS")]
        public string SearchParams { get; set; }
        [Column("USERID")]
        public Guid? UserId { get; set; }
        [Column("UNIVERSAL_GRID_CONFIG_ID")]
        public Guid? UniversalGridConfigurationId { get; set; }
    }
}
