using System;
using System.ComponentModel.DataAnnotations;

namespace DataEditorPortal.Data.Models
{
    public class DataDictionary
    {
        [Key]
        public Guid Id { get; set; }
        public string Label { get; set; }
        public string Value { get; set; }
        public string Value1 { get; set; }
        public string Value2 { get; set; }
        public string Category { get; set; }
    }
}
