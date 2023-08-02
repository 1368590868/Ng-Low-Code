using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataEditorPortal.Data.Models
{
    [Table("EVENT_LOGS")]
    public class EventLog
    {
        [Key]
        [Column("ID")]
        public Guid Id { get; set; }
        [Column("EVENT_TIME")]
        public DateTime EventTime { get; set; }
        [Column("EVENT_SECTION")]
        public string EventSection { get; set; }
        [Column("CATEGORY")]
        public string Category { get; set; }
        [Column("EVENT_NAME")]
        public string EventName { get; set; }
        [Column("USERNAME")]
        public string Username { get; set; }
        [Column("DETAILS")]
        public string Details { get; set; }
        [Column("PARAMS")]
        public string Params { get; set; }
        [Column("RESULT")]
        public string Result { get; set; }
        [Column("CONNECTION")]
        public string Connection { get; set; }
    }
}
