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
        New,
        Current,
        Deleted
    }

    public enum FileStorageType
    {
        FileSystem,
        SqlBinary
    }
}
