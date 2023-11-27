namespace DataEditorPortal.Data.Common
{
    public enum PortalItemStatus
    {
        Draft,
        Published,
        UnPublished
    }

    public enum UploadedFileStatus
    {
        Current = 0,
        Deleted = 1,
        New = 2,
    }

    public enum FileStorageType
    {
        FileSystem,
        SqlBinary
    }

    public enum DataImportResult
    {
        Complete,
        InProgress,
        Failed
    }

    public enum ActionType
    {
        Add,
        Update
    }
}
