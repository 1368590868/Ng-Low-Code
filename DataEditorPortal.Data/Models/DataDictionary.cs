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
        public string Group { get; set; }
    }
}
