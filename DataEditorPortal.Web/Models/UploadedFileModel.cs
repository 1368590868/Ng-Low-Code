using DataEditorPortal.Data.Common;
using DataEditorPortal.Web.Models.UniversalGrid;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace DataEditorPortal.Web.Models
{
    public class UploadedFileModel
    {
        public string FileName { get; set; }
        public string FileId { get; set; }
        public string Comments { get; set; }
        public string ContentType { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public UploadedFileStatus Status { get; set; }
    }

    public class UploadedFileInput
    {
        public List<IFormFile> Files { get; set; }
    }

    public class UploadedFileMeta
    {
        public string FieldName { get; set; }
        public List<UploadedFileModel> UploadedFiles { get; set; }
        public FileUploadConfig FileUploadConfig { get; set; }
    }
}
