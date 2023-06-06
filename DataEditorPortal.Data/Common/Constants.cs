namespace DataEditorPortal.Data.Common
{
    public static class Constants
    {
        public static readonly string DEFAULT_CONNECTION_NAME = "Default";
        public static string DEFAULT_SCHEMA = null; // will be set at startup
        public static readonly string LINK_DATA_FIELD_NAME = "LINK_DATA_FIELD";
    }

    public static class GridItemType
    {
        public static readonly string SINGLE = "single";
        public static readonly string LINKED = "linked";
        public static readonly string LINKED_SINGLE = "linked-single";
    }
}
