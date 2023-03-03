using System;
using System.ComponentModel.DataAnnotations;

namespace DataEditorPortal.Data.Models
{
    public class EventLog
    {
        [Key]
        public Guid Id { get; set; }
        public DateTime EventTime { get; set; }
        public string EventSection { get; set; }
        public string Category { get; set; }
        public string EventName { get; set; }
        public string Username { get; set; }
        public string Details { get; set; }
        public string Params { get; set; }
        public string Result { get; set; }
    }
}
