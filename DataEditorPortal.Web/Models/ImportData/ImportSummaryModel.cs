namespace DataEditorPortal.Web.Models
{

    public class ReviewImportError
    {
        public string Field { get; set; }
        public string ErrorMsg { get; set; }
    }

    public enum ReviewImportStatus
    {
        ReadyToImport,
        Duplicate,
        MissingFields,
        ValidationError,
        AlreadyExists
    }
}
