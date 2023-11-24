using Microsoft.EntityFrameworkCore;
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
        [Precision(18, 2)]
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

    public class DEMO_LINK_PRIMARY
    {
        [Key]
        public int OBJECTID { get; set; }
        public string CREATIONUSER { get; set; }
        public DateTime? DATECREATED { get; set; }
        public DateTime? DATEMODIFIED { get; set; }
        public string LASTUSER { get; set; }
        public string GLOBALID { get; set; }
        public string EVENTID { get; set; }
        public string BOUNDARYGLOBALID { get; set; }
        public string FEATUREGLOBALID { get; set; }
        public string STATUS { get; set; }
        public string NAME { get; set; }
        public string TYPE { get; set; }
        public string STATUS1 { get; set; }
        public string COMMENTS { get; set; }
        public DateTime? DATETIME1 { get; set; }
        public string CRITERIA { get; set; }
        public string ASSESSEDBY { get; set; }
        public DateTime? DATETIME2 { get; set; }
        public DateTime? DATETIME3 { get; set; }
        public DateTime? DATETIME4 { get; set; }
    }

    public class DEMO_LINK_SECONDARY
    {
        [Key]
        public int OBJECTID { get; set; }
        public string CREATIONUSER { get; set; }
        public DateTime? DATECREATED { get; set; }
        public DateTime? DATEMODIFIED { get; set; }
        public string LASTUSER { get; set; }
        public string GLOBALID { get; set; }
        public string EVENTID { get; set; }
        public string BOUNDARYGLOBALID { get; set; }
        public string FEATUREGLOBALID { get; set; }
        public string STATUS { get; set; }
        public string TYPE { get; set; }
        public string STATUS1 { get; set; }
        public string COMMENTS { get; set; }
        public string ASSIGNEDTO { get; set; }
        public DateTime? DATETIME3 { get; set; }
        public DateTime? DATETIME4 { get; set; }
    }

    public class DEMO_LINK_LOOKUP
    {
        public string NAME1 { get; set; }
        public string NAME2 { get; set; }
        public string NAME3 { get; set; }
        public string NAME4 { get; set; }
        public string NAME5 { get; set; }
        public string NAME6 { get; set; }
        [Key]
        public string LOOKUPID { get; set; }
    }

    public class DEMO_LINK_RELATION
    {
        [Key]
        public int OBJECTID { get; set; }
        public int LEFTID { get; set; }
        public int RIGHTID { get; set; }
    }
}
