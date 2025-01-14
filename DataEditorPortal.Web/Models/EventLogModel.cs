﻿namespace DataEditorPortal.Web.Models
{
    public class EventLogModel
    {
        public string Category { get; set; }
        public string Action { get; set; }
        public string Section { get; set; }
        public string Details { get; set; }
        public string Params { get; set; }
        public string Username { get; set; }
        public string Result { get; set; }
    }

    public static class EventLogCategory
    {
        public static readonly string PAGE_REQUEST = "Page Request";
        public static readonly string INFO = "Information";
        public static readonly string ERROR = "Error";
        public static readonly string EXCEPTION = "Exception";
        public static readonly string DATABASE = "Database";
    }
}
