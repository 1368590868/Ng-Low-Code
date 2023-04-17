using System;
using System.ComponentModel.DataAnnotations;

namespace DataEditorPortal.Data.Models
{
    public class LPASITE
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
        public string LPANAME { get; set; }
        public string TYPE { get; set; }
        public string LPASTATUS { get; set; }
        public string COMMENTS { get; set; }
        public DateTime? DISCOVERYDATE { get; set; }
        public string D40CRITERIA { get; set; }
        public string ASSESSEDBY { get; set; }
        public DateTime? REQREMEDIATIONDATE { get; set; }
        public DateTime? REMEDIATIONPROPOSEDDATE { get; set; }
        public DateTime? REMEDIATIONACTUALDATE { get; set; }
    }

    public class LPAREMEDIATIONACTSITE
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
        public string LPAACTIVITYSTATUS { get; set; }
        public string COMMENTS { get; set; }
        public string ASSIGNEDTO { get; set; }
        public DateTime? REMEDIATIONPROPOSEDDATE { get; set; }
        public DateTime? REMEDIATIONACTUALDATE { get; set; }
    }

    public class GFORM_SITE_HIERARCHY_MV
    {
        public string DOT_OPERATOR_NAME { get; set; }
        public string SITETYPE { get; set; }
        public string SITENAME { get; set; }
        public string DIVISION_NAME { get; set; }
        public string AREA_NAME { get; set; }
        public string LOCATION { get; set; }
        [Key]
        public string HIERARCHY_GLOBALID { get; set; }
    }

    public class LPASITE_RELATION
    {
        [Key]
        public int OBJECTID { get; set; }
        public int LEFTID { get; set; }
        public int RIGHTID { get; set; }
    }
}
