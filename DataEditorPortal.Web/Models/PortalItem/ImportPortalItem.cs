using System;
using System.Collections.Generic;

namespace DataEditorPortal.Web.Models.PortalItem
{
    public class PortalItemPreviewModel
    {
        public string Key { get; set; }
        public string DisplayName { get; set; }
        public string Type { get; set; }
        public bool Exist { get; set; }
    }

    public class PortalItemImportModel
    {
        public Guid? ParentId { get; set; }
        public List<string> SelectedObjects { get; set; }
        public UploadedFileModel Attachment { get; set; }
    }
}
