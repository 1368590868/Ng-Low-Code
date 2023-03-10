using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataEditorPortal.Data.Models
{
    [Table("DATA_DICTIONARIES")]
    public class DataDictionary
    {
        [Key]
        [Column("ID")]
        public Guid Id { get; set; }
        [Column("LABEL")]
        public string Label { get; set; }
        [Column("VALUE")]
        public string Value { get; set; }
        [Column("VALUE1")]
        public string Value1 { get; set; }
        [Column("VALUE2")]
        public string Value2 { get; set; }
        [Column("CATEGORY")]
        public string Category { get; set; }
    }
}
