using System;
using System.ComponentModel.DataAnnotations;

namespace DataEditorPortal.Data.Models
{
    public class DemoTable
    {
        [Key]
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string FirstName { get; set; }
        public bool Checked { get; set; }
        public int Number { get; set; }
        public decimal Total { get; set; }
        public DateTime CreateDate { get; set; }
    }
}
