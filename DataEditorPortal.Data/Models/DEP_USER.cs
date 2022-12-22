using System;
using System.ComponentModel.DataAnnotations;

namespace DataEditorPortal.Data.Models
{
    public class DEP_USER
    {
        [Key]
        public Guid ID { get; set; }
        public string USERID { get; set; }
        public string EMPLOYER { get; set; }
        public string COMMENTS { get; set; }
        public string DIVISION { get; set; }
        public string NAME { get; set; }
        public string EMAIL { get; set; }
        public string VENDOR { get; set; }
        public bool AUTO_EMAIL { get; set; }
        public string USERTYPE { get; set; }
        public string PHONE { get; set; }
    }
}
