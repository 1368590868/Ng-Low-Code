using DataEditorPortal.Data.Common;
using System;
using System.Text.Json.Serialization;

namespace DataEditorPortal.Web.Models.ImportData
{
    public class ImportHistoryModel
    {
        public Guid Id { get; set; }

        public string Name { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public DataImportResult Status { get; set; }

        public string Result { get; set; }

        public string CreatedByUser { get; set; }

        public DateTime CreatedDate { get; set; }

        public double Progress { get; set; }
    }
}
