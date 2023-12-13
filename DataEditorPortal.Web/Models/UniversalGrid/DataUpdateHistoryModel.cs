using DataEditorPortal.Data.Common;
using System;

namespace DataEditorPortal.Web.Models.UniversalGrid
{
    public class DataUpdateHistoryModel
    {
        public Guid Id { get; set; }
        public DateTime CreateDate { get; set; }
        public string Username { get; set; }
        public string DataId { get; set; }
        public string Field { get; set; }
        public object OriginalValue { get; set; }
        public object NewValue { get; set; }
        public ActionType ActionType { get; set; }

        public object FieldConfig { get; set; }
    }
}
