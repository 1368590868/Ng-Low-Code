using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataEditorPortal.Data.Models
{
    [Table("DEMO_TABLE")]
    public class DemoTable
    {
        [Key]
        [Column("ID")]
        public Guid Id { get; set; }
        [Column("NAME")]
        public string Name { get; set; }
        [Column("FIRST_NAME")]
        public string FirstName { get; set; }
        [Column("CHECKED")]
        public bool Checked { get; set; }
        [Column("NUMBER")]
        public int Number { get; set; }
        [Column("TOTAL")]
        public decimal Total { get; set; }
        [Column("VENDOR")]
        public string Vendor { get; set; }
        [Column("EMPLOYOR")]
        public string Employor { get; set; }
        [Column("DIVISION")]
        public string Division { get; set; }
        [Column("CREATE_DATE")]
        public DateTime CreateDate { get; set; }
    }
}
