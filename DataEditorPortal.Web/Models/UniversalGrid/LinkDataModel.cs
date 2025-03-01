﻿using System;
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

    public class RelationInfo
    {
        public TableMeta Table1 { get; set; }
        public TableMeta Table2 { get; set; }

        public bool IsOneToMany { get; set; }
        public bool Table1IsPrimary { get; set; }
        public string Query_AddRelation { get; set; }
        public string Query_RemoveRelation { get; set; }
        public string ConnectionString { get; set; }
    }

    public class TableMeta
    {
        public string Name { get; set; }
        public Guid MenuId { get; set; }
        public string IdColumn { get; set; }
        public string TableSchema { get; set; }
        public string TableName { get; set; }
        public List<string> EditorColumns { get; set; }
        public string ReferenceKey { get; set; }
        public string ForeignKey { get; set; }
        public string ConnectionString { get; set; }
        public string Query_AllData { get; set; }
        public string Query_GetRelationDataById { get; set; }
        public string Query_RemoveRelationById { get; set; }
    }
}
