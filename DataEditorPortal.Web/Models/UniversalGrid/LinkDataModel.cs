using System;
using System.Collections.Generic;

namespace DataEditorPortal.Web.Models.UniversalGrid
{
    public class RelationDataModel
    {
        public object Id { get; set; }
        public object Table1Id { get; set; }
        public object Table2Id { get; set; }

        public object Table1RefValue { get; set; }
        public object Table2RefValue { get; set; }
    }

    public class LinkedTableInfo
    {
        public TableMeta Table1 { get; set; }
        public TableMeta Table2 { get; set; }
        public TableMeta LinkTable { get; set; }
    }

    public class TableMeta
    {
        public string Name { get; set; }
        public Guid MenuId { get; set; }
        public string IdColumn { get; set; }
        public string Query_AllData { get; set; }
        public List<string> EditorColumns { get; set; }
        public string Query_GetLinkedDataById { get; set; }
        public string ReferenceKey { get; set; }
        public string ForeignKey { get; set; }
        public string ConnectionString { get; set; }
        public string Query_Insert { get; set; }
        public string Query_DeleteByTable1Id { get; set; }
        public string Query_DeleteById { get; set; }
    }
}
