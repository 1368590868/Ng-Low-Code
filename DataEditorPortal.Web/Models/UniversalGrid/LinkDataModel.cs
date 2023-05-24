using System;

namespace DataEditorPortal.Web.Models.UniversalGrid
{
    public class RelationDataModel
    {
        public object Id { get; set; }
        public object Table1Id { get; set; }
        public object Table2Id { get; set; }
    }

    public class LinkedTableInfo
    {
        public string Table2Name { get; set; }
        public Guid Table2Id { get; set; }
        public string Table2DataSource { get; set; }
        public string Name { get; set; }
        public Guid Id { get; set; }

        public string ConnectionString { get; set; }
        public DataSourceConfig LinkedTable { get; set; }
        public string DataSourceConfig { get; set; }
        public string Table2MappingField { get; set; }
        public string Table1MappingField { get; set; }
    }
}
