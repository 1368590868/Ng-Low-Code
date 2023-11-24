using DataEditorPortal.Data.Common;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json.Serialization;

namespace DataEditorPortal.Web.Models.UniversalGrid
{
    public class GridConfig
    {
        public string Name { get; set; }

        public string Caption { get; set; }
        public string Description { get; set; }
        public string HelpUrl { get; set; }
        public string DataKey { get; set; }
        public int PageSize { get; set; } = 100;

        public bool AllowAdding { get; set; }
        public bool AllowEditing { get; set; }
        public bool AllowDeleting { get; set; }

        public string CustomAddFormName { get; set; }
        public string CustomEditFormName { get; set; }
        public string CustomViewFormName { get; set; }
        public string CustomDeleteFormName { get; set; }

        public List<CustomAction> CustomActions { get; set; }
    }

    public class FormFieldConfig
    {
        public string filterType { get; set; }
        public string key { get; set; }
        public string type { get; set; }
        public object defaultValue { get; set; }
        public object props { get; set; }
        public object validatorConfig { get; set; }
        public ComputedConfig computedConfig { get; set; }
        public object expressionsConfig { get; set; }
        public bool excludeFromImport { get; set; }
    }

    public class ComputedConfig
    {
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public ComputedValueName? name { get; set; }
        public string queryText { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public CommandType type { get; set; }
    }

    public enum ComputedValueName
    {
        CurrentUserName, CurrentUserId, CurrentUserGuid, CurrentUserEmail, CurrentDateTime
    }

    public class SearchConfig
    {
        public bool UseExistingSearch { get; set; }
        public Guid? ExistingSearchId { get; set; }
        public List<SearchFieldConfig> SearchFields { get; set; } = new List<SearchFieldConfig>();
    }

    public class SearchFieldConfig : FormFieldConfig
    {
        // search rule
        public SearchFieldFilterRule searchRule { get; set; }

        // for linked table search
        public SearchFieldFilterRule searchRule1 { get; set; }
    }

    public class SearchFieldFilterRule
    {
        public string field { get; set; }
        public string matchMode { get; set; }
        public string whereClause { get; set; }
    }

    public class GridColConfig
    {
        public string type { get; set; }
        public string field { get; set; }
        public string header { get; set; }
        public int width { get; set; }
        public string filterType { get; set; }

        public bool sortable { get; set; }
        public bool filterable { get; set; }
        public bool enumFilterValue { get; set; }
        public bool hidden { get; set; }

        public string template { get; set; }
        public string format { get; set; }

        public string align { get; set; }

        public FileUploadConfig fileUploadConfig { get; set; }
    }

    public class DataSourceConfig
    {
        public string DataSourceConnectionName { get; set; }
        public string TableName { get; set; }
        public string TableSchema { get; set; }
        public string IdColumn { get; set; }
        public int PageSize { get; set; } = 100;
        public List<string> Columns { get; set; } = new List<string>();
        public List<SortParam> SortBy { get; set; } = new List<SortParam>();
        public List<FilterParam> Filters { get; set; } = new List<FilterParam>();

        public string QueryText { get; set; }
    }

    public class DetailConfig
    {
        public GridFormLayout InfoForm { get; set; }
        public GridFormLayout AddingForm { get; set; }
        public GridFormLayout UpdatingForm { get; set; }
        public GridFormLayout DeletingForm { get; set; }
    }

    public class GridFormLayout
    {
        public bool Enabled { get; set; }
        public bool UseAddingFormLayout { get; set; } = true;
        public bool UseCustomForm { get; set; }
        public string CustomFormName { get; set; }
        public List<FormFieldConfig> FormFields { get; set; } = new List<FormFieldConfig>();
        public string QueryText { get; set; }
        public FormEventConfig AfterSaved { get; set; }
        public FormEventConfig OnValidate { get; set; }
    }

    public class CustomAction
    {
        public string Name { get; set; }
    }

    public enum FormEventType
    {
        QueryText, QueryStoredProcedure, CommandLine, Javascript
    }

    public class FormEventConfig
    {
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public FormEventType EventType { get; set; }
        public string Script { get; set; }
    }

    public class LinkedDataSourceConfig
    {
        public LinkedTableConfig PrimaryTable { get; set; }
        public LinkedTableConfig SecondaryTable { get; set; }

        public RelationDataSourceConfig LinkTable { get; set; }

        public bool UseAsMasterDetailView { get; set; }
    }

    public class RelationDataSourceConfig : DataSourceConfig
    {
        public bool IsOneToMany { get; set; }
        public string PrimaryReferenceKey { get; set; }
        public string PrimaryForeignKey { get; set; }
        public string SecondaryReferenceKey { get; set; }
        public string SecondaryForeignKey { get; set; }
        public string QueryInsert { get; set; }
    }

    public class LinkedTableConfig
    {
        public Guid Id { get; set; }
        public List<string> ColumnsForLinkedField { get; set; }
    }

    public class FileUploadConfig
    {
        public string DataSourceConnectionName { get; set; }
        public string TableName { get; set; }
        public string TableSchema { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public FileStorageType FileStorageType { get; set; }
        public string ForeignKeyName { get; set; }
        public string BasePath { get; set; }
        public Dictionary<string, string> FieldMapping { get; set; }
        public Dictionary<string, string> CustomFields { get; set; }
        public string GetMappedColumn(string column)
        {
            return FieldMapping.FirstOrDefault(x => x.Key == column).Value;
        }
    }
}
