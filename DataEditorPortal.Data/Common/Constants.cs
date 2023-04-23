using System;

namespace DataEditorPortal.Data.Common
{
    public static class Constants
    {
        public static readonly Guid DEFAULT_CONNECTION_ID = new Guid("4DEFF6DB-D3D6-447F-B3DE-CE2D8B242E36");
        public static readonly string DEFAULT_SCHEMA = "DATA_EDITOR_PORTAL";
        public static readonly string LINK_DATA_FIELD_NAME = "LINK_DATA_FIELD";
    }

    public static class GridItemType
    {
        public static readonly string SINGLE = "single";
        public static readonly string LINKED = "linked";
        public static readonly string LINKED_SINGLE = "linked-single";
    }
}
