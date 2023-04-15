using AutoMapper;
using Dapper;
using DataEditorPortal.Data.Common;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using DataEditorPortal.ExcelExport;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Models;
using DataEditorPortal.Web.Models.UniversalGrid;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text.Json;

namespace DataEditorPortal.Web.Services
{
    public interface IUniversalGridService
    {
        GridConfig GetGridConfig(string name);
        List<GridColConfig> GetGridColumnsConfig(string name);
        List<DropdownOptionsItem> GetGridColumnFilterOptions(string name, string column);
        List<SearchFieldConfig> GetGridSearchConfig(string name);
        List<FormFieldConfig> GetGridFormConfig(string name, string type);
        GridFormLayout GetFormEventConfig(string name, string type);

        GridData GetGridData(string name, GridParam param);
        List<FilterParam> ProcessFilterParam(List<FilterParam> filters, List<FilterParam> filtersApplied);
        GridData QueryGridData(DbConnection con, string queryText, object queryParams, string gridName, bool writeLog = false);
        MemoryStream ExportExcel(string name, ExportParam param);

        IDictionary<string, object> GetGridDataDetail(string name, string id);
        bool OnValidateGridData(string name, string type, string id, Dictionary<string, object> model);
        bool UpdateGridData(string name, string id, Dictionary<string, object> model);
        bool AddGridData(string name, Dictionary<string, object> model);
        bool DeleteGridData(string name, string[] ids);

        // linked table api
        dynamic GetLinkedGridConfig(string name);
        GridData GetLinkedTableDataForFieldControl(string table1Name, GridParam param);
        dynamic GetLinkedTableConfigForFieldControl(string tableName);
        IEnumerable<object> GetLinkedDataIdsForList(string table1Name, string table2Id);

    }

    public class UniversalGridService : IUniversalGridService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly DepDbContext _depDbContext;
        private readonly IQueryBuilder _queryBuilder;
        private readonly ILogger<UniversalGridService> _logger;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IEventLogService _eventLogService;
        private readonly IAttachmentService _attachmentService;
        private readonly IMemoryCache _memoryCache;

        public UniversalGridService(
            IServiceProvider serviceProvider,
            DepDbContext depDbContext,
            IQueryBuilder queryBuilder,
            ILogger<UniversalGridService> logger,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor,
            IEventLogService eventLogService,
            IAttachmentService attachmentService,
            IMemoryCache memoryCache)
        {
            _serviceProvider = serviceProvider;
            _depDbContext = depDbContext;
            _queryBuilder = queryBuilder;
            _logger = logger;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _eventLogService = eventLogService;
            _attachmentService = attachmentService;
            _memoryCache = memoryCache;
        }

        #region Grid cofnig, columns config, search config and detail form config

        public GridConfig GetGridConfig(string name)
        {
            var item = _depDbContext.SiteMenus.Where(x => x.Name == name).FirstOrDefault();
            if (item == null) throw new DepException($"Portal Item with name:{name} deosn't exists");

            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == name);
            if (config == null) throw new DepException("Grid configuration does not exists with name: " + name);

            // get query text for list data from grid config.
            var dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);

            var result = new GridConfig()
            {
                Name = config.Name,
                DataKey = dataSourceConfig.IdColumn,
                Description = item.Description,
                HelpUrl = item.HelpUrl,
                Caption = item.Label,
                CustomActions = new List<CustomAction>(),
                PageSize = dataSourceConfig.PageSize
            };

            // get query text for list data from grid config.
            var detailConfig = JsonSerializer.Deserialize<DetailConfig>(config.DetailConfig);
            if (detailConfig != null)
            {
                if (detailConfig.AddingForm != null && detailConfig.AddingForm.UseCustomForm)
                    result.CustomAddFormName = detailConfig.AddingForm.CustomFormName;
                if (detailConfig.UpdatingForm != null && detailConfig.UpdatingForm.UseCustomForm)
                    result.CustomEditFormName = detailConfig.UpdatingForm.CustomFormName;
                if (detailConfig.InfoForm != null && detailConfig.InfoForm.UseCustomForm)
                    result.CustomViewFormName = detailConfig.InfoForm.CustomFormName;
                if (detailConfig.DeletingForm != null && detailConfig.DeletingForm.UseCustomForm)
                    result.CustomDeleteFormName = detailConfig.DeletingForm.CustomFormName;
            }

            _mapper.Map(detailConfig, result);

            if (!string.IsNullOrEmpty(config.CustomActionConfig))
                result.CustomActions = JsonSerializer.Deserialize<List<CustomAction>>(config.CustomActionConfig);

            return result;
        }

        public List<GridColConfig> GetGridColumnsConfig(string name)
        {
            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == name);
            if (config == null) throw new DepException("Grid configuration does not exists with name: " + name);

            if (string.IsNullOrEmpty(config.ColumnsConfig)) config.ColumnsConfig = "[]";

            return JsonSerializer.Deserialize<List<GridColConfig>>(config.ColumnsConfig);
        }

        public List<SearchFieldConfig> GetGridSearchConfig(string name)
        {
            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == name);
            if (config == null) throw new DepException("Grid configuration does not exists with name: " + name);

            if (string.IsNullOrEmpty(config.SearchConfig)) config.SearchConfig = "[]";

            var result = JsonSerializer.Deserialize<List<SearchFieldConfig>>(config.SearchConfig);

            result.ForEach(x => x.searchRule = null);

            return result;
        }

        public List<FormFieldConfig> GetGridFormConfig(string name, string type)
        {
            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == name);
            if (config == null) throw new DepException("Grid configuration does not exists with name: " + name);

            if (string.IsNullOrEmpty(config.DetailConfig)) throw new DepException("Grid Detail Config can not be empty.");

            var detailConfig = JsonSerializer.Deserialize<DetailConfig>(config.DetailConfig);

            #region validation
            if (type == "ADD")
            {
                if (detailConfig.AddingForm != null && detailConfig.AddingForm.UseCustomForm)
                {
                    throw new DepException("This universal detail api doesn't support custom action. Please use custom api in custom action.");
                }
                if (detailConfig.AddingForm == null || detailConfig.AddingForm.FormFields.Count == 0)
                {
                    throw new DepException("No adding form configured for this portal item. Please go Portal Management to complete the configuration.");
                }
                if (detailConfig.AddingForm.UseCustomForm)
                {
                    throw new DepException("This universal detail api doesn't support custom action. Please use custom api in custom action.");
                }
            }
            if (type == "UPDATE")
            {
                if (detailConfig.UpdatingForm != null && detailConfig.UpdatingForm.UseCustomForm)
                {
                    throw new DepException("This universal detail api doesn't support custom action. Please use custom api in custom action.");
                }
                if (detailConfig.UpdatingForm == null || (!detailConfig.UpdatingForm.UseAddingFormLayout && detailConfig.UpdatingForm.FormFields.Count == 0))
                {
                    throw new DepException("No Updating form configured for this portal item. Please go Portal Management to complete the configuration.");
                }
                if (detailConfig.UpdatingForm.UseAddingFormLayout &&
                    (detailConfig.AddingForm == null || detailConfig.AddingForm.UseCustomForm || detailConfig.AddingForm.FormFields.Count == 0))
                {
                    throw new DepException("Updating form is configured to use the same configuration of adding form, but no adding form configured. Please go Portal Management to complete the configuration.");
                }
            }
            #endregion

            var formLayout = type == "ADD" ? detailConfig.AddingForm : detailConfig.UpdatingForm;
            if (formLayout.UseAddingFormLayout)
                formLayout.FormFields = detailConfig.AddingForm.FormFields;

            return formLayout.FormFields
                // filter the auto calculated fields.
                .Where(x => x.computedConfig == null || (!x.computedConfig.name.HasValue && string.IsNullOrEmpty(x.computedConfig.queryText)))
                .ToList();
        }

        public GridFormLayout GetFormEventConfig(string name, string type)
        {
            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == name);
            if (config == null) throw new DepException("Grid configuration does not exists with name: " + name);

            if (string.IsNullOrEmpty(config.DetailConfig)) throw new DepException("Grid Detail Config can not be empty.");

            var detailConfig = JsonSerializer.Deserialize<DetailConfig>(config.DetailConfig);

            type = type.ToLower();
            var formLayout = type == "add" ? detailConfig.AddingForm : type == "update" ? detailConfig.UpdatingForm : type == "delete" ? detailConfig.DeletingForm : null;

            // do not send query text to front end.
            if (formLayout.OnValidate != null && formLayout.OnValidate.EventType != FormEventType.Javascript) formLayout.OnValidate.Script = null;
            // if event config is not javascript, do not send to front end.
            if (formLayout.AfterSaved != null && formLayout.AfterSaved.EventType != FormEventType.Javascript) formLayout.AfterSaved = null;

            return new GridFormLayout() { OnValidate = formLayout.OnValidate, AfterSaved = formLayout.AfterSaved };
        }

        #endregion

        #region Grid List data
        public GridData GetGridData(string name, GridParam param)
        {
            var config = _memoryCache.GetOrCreate($"grid.{name}", entry =>
            {
                entry.SetSlidingExpiration(TimeSpan.FromMinutes(30));
                return _depDbContext.UniversalGridConfigurations.Include(x => x.DataSourceConnection).FirstOrDefault(x => x.Name == name);
            });
            if (config == null) throw new DepException("Grid configuration does not exists with name: " + name);

            #region compose the query text

            // get query text for list data from grid config.
            var dataSourceConfig = _memoryCache.GetOrCreate($"grid.{name}.datasource", entry =>
            {
                entry.SetSlidingExpiration(TimeSpan.FromMinutes(30));
                var result = new DataSourceConfig();
                if (config.ItemType == GridItemType.LINKED)
                {
                    var linkedDataSourceConfig = JsonSerializer.Deserialize<LinkedDataSourceConfig>(config.DataSourceConfig);
                    result = linkedDataSourceConfig.LinkedTable;
                }
                else
                {
                    result = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);
                }
                return result;
            });

            var filtersApplied = ProcessFilterParam(dataSourceConfig.Filters, new List<FilterParam>());
            var queryText = _queryBuilder.GenerateSqlTextForList(dataSourceConfig);

            // convert search criteria to where clause
            var searchConfigStr = !string.IsNullOrEmpty(config.SearchConfig) ? config.SearchConfig : "[]";
            var searchConfig = JsonSerializer.Deserialize<List<SearchFieldConfig>>(searchConfigStr);
            var searchRules = new List<FilterParam>();
            if (param.Searches != null)
            {
                searchRules = param.Searches
                    .Where(x => x.Value != null)
                    .Select(x =>
                    {
                        FilterParam param = null;

                        var fieldConfig = searchConfig.FirstOrDefault(s => s.key == x.Key);
                        if (fieldConfig != null && fieldConfig.searchRule != null)
                        {
                            param = new FilterParam
                            {
                                field = fieldConfig.searchRule.field,
                                matchMode = fieldConfig.searchRule.matchMode,
                                value = x.Value,
                                whereClause = fieldConfig.searchRule.whereClause
                            };
                        }
                        return param;
                    })
                    .Where(x => x != null)
                    .ToList();
            }
            filtersApplied = ProcessFilterParam(searchRules, filtersApplied);
            queryText = _queryBuilder.UseSearches(queryText, searchRules);

            // convert grid filter to where clause
            filtersApplied = ProcessFilterParam(param.Filters, filtersApplied);
            queryText = _queryBuilder.UseFilters(queryText, param.Filters);

            // set default sorts
            if (!param.Sorts.Any())
            {
                param.Sorts = dataSourceConfig.SortBy;
                if (!param.Sorts.Any())
                    param.Sorts = new List<SortParam>() { new SortParam { field = dataSourceConfig.IdColumn, order = 1 } };
            }

            if (param.IndexCount > 0)
            {
                // use pagination
                queryText = _queryBuilder.UsePagination(queryText, param.StartIndex, param.IndexCount, param.Sorts);
            }
            else
            {
                // replace the order by clause by input Sorts in queryText
                queryText = _queryBuilder.UseOrderBy(queryText, param.Sorts);
            }

            // join attachments 
            var attachmentCols = GetAttachmentCols(config);
            if (attachmentCols.Any())
                queryText = _queryBuilder.JoinAttachments(queryText, attachmentCols);

            #endregion

            var keyValues = filtersApplied.Select(x => new KeyValuePair<string, object>($"{x.field}_{x.index}", x.value));
            var queryParams = _queryBuilder.GenerateDynamicParameter(keyValues);

            // run sql query text
            var output = new GridData();
            using (var con = _serviceProvider.GetRequiredService<DbConnection>())
            {
                con.ConnectionString = config.DataSourceConnection.ConnectionString;

                output = QueryGridData(con, queryText, queryParams, name);
            }

            return output;
        }

        public List<FilterParam> ProcessFilterParam(List<FilterParam> filters, List<FilterParam> filtersApplied)
        {
            if (filtersApplied == null) filtersApplied = new List<FilterParam>();

            foreach (var filter in filters)
            {
                filter.index = filtersApplied.Count(x => x.field == x.field);
                filtersApplied.Add(filter);
            };

            return filtersApplied;
        }

        public GridData QueryGridData(DbConnection con, string queryText, object queryParams, string gridName, bool writeLog = true)
        {
            var output = new GridData();
            try
            {
                con.Open();

                DataTable schema;
                using (var dr = con.ExecuteReader(queryText, queryParams))
                {
                    schema = dr.GetSchemaTable();
                }

                var data = con.Query(queryText, queryParams).ToList();
                data.ForEach(item =>
                {
                    var row = (IDictionary<string, object>)item;
                    foreach (var key in row.Keys)
                    {
                        var index = row.Keys.ToList().IndexOf(key);
                        row[key] = _queryBuilder.TransformValue(row[key], schema.Rows[index]);
                    }
                    output.Data.Add(row);
                });

                if (output.Data.Any() && output.Data[0].Keys.Contains("DEP_TOTAL"))
                {
                    output.Total = Convert.ToInt32(output.Data[0]["DEP_TOTAL"]);
                }
                foreach (var item in output.Data)
                {
                    if (item.Keys.Contains("DEP_TOTAL")) item.Remove("DEP_TOTAL");
                    if (item.Keys.Contains("DEP_ROWNUMBER")) item.Remove("DEP_ROWNUMBER");
                }

                if (writeLog)
                    _eventLogService.AddDbQueryLog(EventLogCategory.DB_SUCCESS, gridName, queryText, queryParams);
            }
            catch (Exception ex)
            {
                if (writeLog)
                    _eventLogService.AddDbQueryLog(EventLogCategory.DB_ERROR, gridName, queryText, queryParams, ex.Message);
                _logger.LogError(ex.Message, ex);
                throw new DepException("An Error in the query has occurred: " + ex.Message);
            }

            return output;
        }

        public MemoryStream ExportExcel(string name, ExportParam param)
        {
            var columns = GetGridColumnsConfig(name).Where(x => x.type == "DataBaseField").ToList();

            var result = GetGridData(name, param);

            List<DataParam> sheetData = new List<DataParam>();

            var sheet = new SheetParam() { Name = "Data", ID = 1, ColumnParams = new List<ColumnOptions>() };

            #region add header
            var colIndex = 0;
            foreach (var item in columns)
            {
                colIndex++;
                DataParam header = new DataParam()
                {
                    C2 = colIndex,
                    R2 = 1,
                    Text = item.header,
                    Type = "String",
                    FormatCell = new FormatOptions() { WrapText = true, BackGroundColor = "cccccc" }
                };
                sheet.ColumnParams.Add(new ColumnOptions() { Index2 = colIndex, Width = 20 });
                sheetData.Add(header);
            }
            #endregion

            #region add data
            var rowIndex = 1;
            foreach (var row in result.Data)
            {
                colIndex = 0;
                rowIndex++;
                foreach (var item in columns)
                {
                    colIndex++;
                    DataParam data = new DataParam()
                    {
                        C2 = colIndex,
                        R2 = rowIndex,
                        Text = (string)FormatExportedValue(item, row[item.field]),
                        Type = item.filterType
                    };
                    sheetData.Add(data);
                }
            }
            #endregion

            sheet.FilterParam = new List<AutoFilterOptions>
            {
                new AutoFilterOptions()
                {
                    FromRow = 1,
                    ToRow = rowIndex,
                    FromColumn = 1,
                    ToColumn = sheet.ColumnParams.Count
                }
            };

            var stream = new MemoryStream();
            var exp = new Exporters();
            exp.Addsheet(sheet, sheetData, stream);
            stream.Seek(0, SeekOrigin.Begin);
            return stream;
        }

        public List<DropdownOptionsItem> GetGridColumnFilterOptions(string name, string column)
        {
            var config = _depDbContext.UniversalGridConfigurations.Include(x => x.DataSourceConnection).FirstOrDefault(x => x.Name == name);
            if (config == null) throw new DepException("Grid configuration does not exists with name: " + name);

            var dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);
            var columnsConfig = JsonSerializer.Deserialize<List<GridColConfig>>(config.ColumnsConfig);

            var result = new List<object>();
            var columnConfig = columnsConfig.FirstOrDefault(x => x.field == column);
            if (columnConfig != null && columnConfig.filterType == "enums")
            {
                dataSourceConfig.Columns = new List<string>() { columnConfig.field };
                var query = _queryBuilder.GenerateSqlTextForColumnFilterOption(dataSourceConfig);

                using (var con = _serviceProvider.GetRequiredService<DbConnection>())
                {
                    con.ConnectionString = config.DataSourceConnection.ConnectionString;

                    try
                    {
                        result = con.Query(query)
                            .Select(x => ((IDictionary<string, object>)x)[columnConfig.field])
                            .Where(x => x != null && x != DBNull.Value)
                            .ToList();

                        _eventLogService.AddDbQueryLog(EventLogCategory.DB_SUCCESS, name, query, null);
                    }
                    catch (Exception ex)
                    {
                        _eventLogService.AddDbQueryLog(EventLogCategory.DB_ERROR, name, query, null, ex.Message);
                        throw new DepException("An Error in the query has occurred: " + ex.Message);
                    }
                    finally
                    {
                        con.Close();
                    }
                }

            }

            return result
                .Select(x => new DropdownOptionsItem { Label = x, Value = x })
                .OrderBy(x => x.Label)
                .ToList();
        }

        private object FormatExportedValue(GridColConfig column, object value)
        {
            if (value == null) return "";
            if (column.filterType == "boolean")
            {
                return (bool)value ? "Yes" : "No";
            }
            else
            {
                return value.ToString();
            }
        }

        #endregion

        #region Grid detail, add, update and remove

        public IDictionary<string, object> GetGridDataDetail(string name, string id)
        {
            var config = _memoryCache.GetOrCreate($"grid.{name}", entry =>
            {
                entry.SetSlidingExpiration(TimeSpan.FromMinutes(30));
                return _depDbContext.UniversalGridConfigurations.Include(x => x.DataSourceConnection).FirstOrDefault(x => x.Name == name);
            });
            if (config == null) throw new DepException("Grid configuration does not exists with name: " + name);

            // get query text for list data from grid config.
            var dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);
            var queryText = _queryBuilder.GenerateSqlTextForDetail(dataSourceConfig);

            // join attachments 
            var attachmentCols = GetAttachmentCols(config);
            if (attachmentCols.Any())
                queryText = _queryBuilder.JoinAttachments(queryText, attachmentCols);

            IDictionary<string, object> result = new Dictionary<string, object>();
            using (var con = _serviceProvider.GetRequiredService<DbConnection>())
            {
                con.ConnectionString = config.DataSourceConnection.ConnectionString;

                // always provide Id column parameter
                var param = _queryBuilder.GenerateDynamicParameter(new Dictionary<string, object>() { { dataSourceConfig.IdColumn, id } });

                try
                {
                    con.Open();

                    DataTable schema;
                    using (var dr = con.ExecuteReader(queryText, param))
                    {
                        schema = dr.GetSchemaTable();
                    }
                    result = (IDictionary<string, object>)con.QueryFirst(queryText, param);
                    foreach (var key in result.Keys)
                    {
                        var index = result.Keys.ToList().IndexOf(key);
                        result[key] = _queryBuilder.TransformValue(result[key], schema.Rows[index]);
                    }

                    _eventLogService.AddDbQueryLog(EventLogCategory.DB_SUCCESS, name, queryText, param);
                }
                catch (Exception ex)
                {
                    _eventLogService.AddDbQueryLog(EventLogCategory.DB_ERROR, name, queryText, param, ex.Message);
                    _logger.LogError(ex.Message, ex);
                    throw new DepException("An Error in the query has occurred: " + ex.Message);
                }
            }

            if (config.ItemType == GridItemType.LINKED_SINGLE)
            {
                var list = result.AsList();
                list.Add(new KeyValuePair<string, object>(Constants.LINK_DATA_FIELD_NAME, GetLinkDataModelForForm(config.Name, id)));
                return list.ToDictionary(x => x.Key, x => x.Value);
            }
            else
                return result;
        }

        public bool OnValidateGridData(string name, string type, string id, Dictionary<string, object> model)
        {
            var config = _depDbContext.UniversalGridConfigurations.Include(x => x.DataSourceConnection).FirstOrDefault(x => x.Name == name);
            if (config == null) throw new DepException("Grid configuration does not exists with name: " + name);

            // get query text for list data from grid config.
            var dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);

            // get detail config
            var detailConfig = JsonSerializer.Deserialize<DetailConfig>(config.DetailConfig);

            type = type.ToLower();
            var formLayout = type == "add" ? detailConfig.AddingForm : type == "update" ? detailConfig.UpdatingForm : type == "delete" ? detailConfig.DeletingForm : null;
            if (formLayout == null || formLayout.OnValidate == null)
            {
                throw new DepException($"No {type} form configured for this portal item. Please go Portal Management to complete the configuration.");
            }
            if (formLayout != null && formLayout.UseCustomForm)
            {
                throw new DepException("This universal detail api doesn't support custom action. Please use custom api in custom action.");
            }

            if (formLayout.OnValidate.EventType == FormEventType.Javascript || formLayout.OnValidate.EventType == FormEventType.CommandLine)
                return true;

            var result = false;

            using (var con = _serviceProvider.GetRequiredService<DbConnection>())
            {
                con.ConnectionString = config.DataSourceConnection.ConnectionString;
                con.Open();

                #region prepair values and paramsters

                // add Id parameters
                if (model.ContainsKey(dataSourceConfig.IdColumn))
                    model[dataSourceConfig.IdColumn] = id;
                else
                    model.Add(dataSourceConfig.IdColumn, id);

                // calculate the computed field values
                AssignComputedValues(formLayout.FormFields, model, con);

                // generate the query text and parameter
                var queryText = _queryBuilder.ReplaceQueryParamters(formLayout.OnValidate.Script);
                var param = _queryBuilder.GenerateDynamicParameter(model.AsEnumerable());

                #endregion

                // excute command
                try
                {
                    var commandType = formLayout.OnValidate.EventType == FormEventType.QueryText ? CommandType.Text : CommandType.StoredProcedure;
                    var data = con.ExecuteScalar(queryText, param, null, null, commandType);
                    if (data != DBNull.Value && data != null)
                    {
                        var temp = 0;
                        int.TryParse(data.ToString(), out temp);
                        result = temp == 1;
                    }

                    _eventLogService.AddDbQueryLog(EventLogCategory.DB_SUCCESS, name, queryText, param, result.ToString());
                }
                catch (Exception ex)
                {
                    _eventLogService.AddDbQueryLog(EventLogCategory.DB_ERROR, name, queryText, param, ex.Message);
                    _logger.LogError(ex.Message, ex);
                    throw new DepException("An Error in the query has occurred: " + ex.Message);
                }
            }

            return result;
        }

        public bool AddGridData(string name, Dictionary<string, object> model)
        {
            var config = _depDbContext.UniversalGridConfigurations.Include(x => x.DataSourceConnection).FirstOrDefault(x => x.Name == name);
            if (config == null) throw new DepException("Grid configuration does not exists with name: " + name);

            // get query text for list data from grid config.
            var dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);

            // get detail config
            var detailConfig = JsonSerializer.Deserialize<DetailConfig>(config.DetailConfig);
            if (detailConfig.AddingForm != null && detailConfig.AddingForm.UseCustomForm)
            {
                throw new DepException("This universal detail api doesn't support custom action. Please use custom api in custom action.");
            }
            if (detailConfig.AddingForm == null || detailConfig.AddingForm.FormFields.Count == 0)
            {
                throw new DepException("No adding form configured for this portal item. Please go Portal Management to complete the configuration.");
            }
            if (detailConfig.AddingForm.UseCustomForm)
            {
                throw new DepException("This universal detail api doesn't support custom action. Please use custom api in custom action.");
            }

            var formLayout = detailConfig.AddingForm;
            using (var con = _serviceProvider.GetRequiredService<DbConnection>())
            {
                con.ConnectionString = config.DataSourceConnection.ConnectionString;
                con.Open();

                #region prepair values and params

                // process file upload, store json string
                var uploadedFieldsMeta = ProcessFileUploadFileds(formLayout.FormFields, model);

                List<RelationDataModel> relationData = null;
                if (config.ItemType == GridItemType.LINKED_SINGLE)
                {
                    // process link data field, get meta data and clear value in model
                    relationData = ProcessLinkDataField(model);
                }

                // calculate the computed field values
                AssignComputedValues(formLayout.FormFields, model, con);

                // filter the columns that have values
                var columns = formLayout.FormFields
                    .Select(x => x.key)
                    .Where(x => model.Keys.Contains(x) && model[x] != null)
                    .ToList();

                // generate the query text and parameters
                var queryText = _queryBuilder.GenerateSqlTextForInsert(new DataSourceConfig()
                {
                    IdColumn = dataSourceConfig.IdColumn,
                    TableSchema = dataSourceConfig.TableSchema,
                    TableName = dataSourceConfig.TableName,
                    Columns = columns,
                    QueryText = formLayout.QueryText
                });
                var param = _queryBuilder.GenerateDynamicParameter(model.AsEnumerable());

                #endregion

                // excute command
                var trans = con.BeginTransaction();
                try
                {
                    var dynamicParameters = new DynamicParameters(param);
                    var paramReturnId = _queryBuilder.ParameterName($"RETURNED_{dataSourceConfig.IdColumn}");
                    dynamicParameters.Add(paramReturnId, dbType: null, direction: ParameterDirection.Output, size: 40);

                    var affected = con.Execute(queryText, dynamicParameters, trans);
                    var returnedId = dynamicParameters.Get<object>(paramReturnId);

                    if (uploadedFieldsMeta.Any())
                    {
                        // assign fileUploadConfig and save files
                        var attachmentCols = GetAttachmentCols(config);
                        uploadedFieldsMeta.ForEach(x => x.FileUploadConfig = attachmentCols.FirstOrDefault(c => c.field == x.FieldName).fileUploadConfig);
                        SaveUploadedFiles(uploadedFieldsMeta, returnedId, config.Name);
                    }

                    if (relationData != null)
                    {
                        // update linked data
                        UpdateLinkData(config.Name, returnedId, relationData);
                    }

                    trans.Commit();

                    _eventLogService.AddDbQueryLog(EventLogCategory.DB_SUCCESS, name, queryText, param, $"{affected} rows affected.");

                    // run after saved event handler
                    AfterSaved(new EventActionModel()
                    {
                        EventName = "After Inserting",
                        EventSection = config.Name,
                        EventConfig = formLayout.AfterSaved,
                        Username = AppUser.ParseUsername(_httpContextAccessor.HttpContext.User.Identity.Name).Username,
                        ConnectionString = config.DataSourceConnection.ConnectionString
                    }, model);
                }
                catch (Exception ex)
                {
                    trans.Rollback();

                    _eventLogService.AddDbQueryLog(EventLogCategory.DB_ERROR, name, queryText, param, ex.Message);
                    _logger.LogError(ex.Message, ex);
                    throw new DepException("An Error in the query has occurred: " + ex.Message);
                }
            }

            return true;
        }

        public bool UpdateGridData(string name, string id, Dictionary<string, object> model)
        {
            var config = _depDbContext.UniversalGridConfigurations.Include(x => x.DataSourceConnection).FirstOrDefault(x => x.Name == name);
            if (config == null) throw new DepException("Grid configuration does not exists with name: " + name);

            // get query text for list data from grid config.
            var dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);

            // get detail config
            var detailConfig = JsonSerializer.Deserialize<DetailConfig>(config.DetailConfig);

            if (detailConfig.UpdatingForm != null && detailConfig.UpdatingForm.UseCustomForm)
            {
                throw new DepException("This universal detail api doesn't support custom action. Please use custom api in custom action.");
            }
            if (detailConfig.UpdatingForm == null || (!detailConfig.UpdatingForm.UseAddingFormLayout && detailConfig.UpdatingForm.FormFields.Count == 0))
            {
                throw new DepException("No Updating form configured for this portal item. Please go Portal Management to complete the configuration.");
            }
            if (detailConfig.UpdatingForm.UseAddingFormLayout &&
                (detailConfig.AddingForm == null || detailConfig.AddingForm.UseCustomForm || detailConfig.AddingForm.FormFields.Count == 0))
            {
                throw new DepException("Updating form is configured to use the same configuration of adding form, but no adding form configured. Please go Portal Management to complete the configuration.");
            }

            var updatingForm = detailConfig.UpdatingForm;
            if (updatingForm.UseAddingFormLayout)
            {
                updatingForm = detailConfig.AddingForm;
                updatingForm.QueryText = detailConfig.UpdatingForm.QueryText;
            }

            var formLayout = updatingForm;

            using (var con = _serviceProvider.GetRequiredService<DbConnection>())
            {
                con.ConnectionString = config.DataSourceConnection.ConnectionString;
                con.Open();

                #region prepair values and paramsters

                // process file upload, store json string
                var uploadedFieldsMeta = ProcessFileUploadFileds(formLayout.FormFields, model);

                List<RelationDataModel> relationData = null;
                if (config.ItemType == GridItemType.LINKED_SINGLE)
                {
                    // process link data field, get meta data and clear value in model
                    relationData = ProcessLinkDataField(model);
                }

                // calculate the computed field values
                AssignComputedValues(formLayout.FormFields, model, con);

                // filter the columns that have values
                var columns = formLayout.FormFields
                    .Select(x => x.key)
                    .Where(x => model.Keys.Contains(x) && model[x] != null)
                    .ToList();

                // generate the query text
                var queryText = _queryBuilder.GenerateSqlTextForUpdate(new DataSourceConfig()
                {
                    TableSchema = dataSourceConfig.TableSchema,
                    TableName = dataSourceConfig.TableName,
                    IdColumn = dataSourceConfig.IdColumn,
                    Columns = columns,
                    QueryText = formLayout.QueryText
                });

                // add query parameters
                if (model.ContainsKey(dataSourceConfig.IdColumn))
                    model[dataSourceConfig.IdColumn] = id;
                else
                    model.Add(dataSourceConfig.IdColumn, id);
                var param = _queryBuilder.GenerateDynamicParameter(model.AsEnumerable());

                #endregion

                // excute command
                var trans = con.BeginTransaction();
                try
                {
                    var affected = con.Execute(queryText, param, trans);

                    if (uploadedFieldsMeta.Any())
                    {
                        // assign fileUploadConfig and save files
                        var attachmentCols = GetAttachmentCols(config);
                        uploadedFieldsMeta.ForEach(x => x.FileUploadConfig = attachmentCols.FirstOrDefault(c => c.field == x.FieldName).fileUploadConfig);
                        SaveUploadedFiles(uploadedFieldsMeta, id, config.Name);
                    }

                    if (relationData != null)
                    {
                        // update linked data
                        UpdateLinkData(config.Name, id, relationData);
                    }

                    trans.Commit();

                    _eventLogService.AddDbQueryLog(EventLogCategory.DB_SUCCESS, name, queryText, param, $"{affected} rows affected.");

                    // run after saved event
                    AfterSaved(new EventActionModel()
                    {
                        EventName = "After Updating",
                        EventSection = config.Name,
                        EventConfig = formLayout.AfterSaved,
                        Username = AppUser.ParseUsername(_httpContextAccessor.HttpContext.User.Identity.Name).Username,
                        ConnectionString = config.DataSourceConnection.ConnectionString
                    }, model);
                }
                catch (Exception ex)
                {
                    trans.Rollback();

                    _eventLogService.AddDbQueryLog(EventLogCategory.DB_ERROR, name, queryText, param, ex.Message);
                    _logger.LogError(ex.Message, ex);
                    throw new DepException("An Error in the query has occurred: " + ex.Message);
                }
            }

            return true;
        }

        public bool DeleteGridData(string name, string[] ids)
        {
            var config = _depDbContext.UniversalGridConfigurations.Include(x => x.DataSourceConnection).FirstOrDefault(x => x.Name == name);
            if (config == null) throw new DepException("Grid configuration does not exists with name: " + name);

            // get query text for list data from grid config.
            var dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);

            // get detail config
            var detailConfig = JsonSerializer.Deserialize<DetailConfig>(config.DetailConfig);
            if (detailConfig.DeletingForm != null && detailConfig.DeletingForm.UseCustomForm)
            {
                throw new DepException("This universal detail api doesn't support custom action. Please use custom api in custom action.");
            }

            var queryText = _queryBuilder.GenerateSqlTextForDelete(new DataSourceConfig()
            {
                TableSchema = dataSourceConfig.TableSchema,
                TableName = dataSourceConfig.TableName,
                IdColumn = dataSourceConfig.IdColumn,
                QueryText = detailConfig.DeletingForm?.QueryText
            });

            var param = _queryBuilder.GenerateDynamicParameter(
                        new List<KeyValuePair<string, object>>() {
                            new KeyValuePair<string, object>(dataSourceConfig.IdColumn, ids)
                        }
                    );

            using (var con = _serviceProvider.GetRequiredService<DbConnection>())
            {
                con.ConnectionString = config.DataSourceConnection.ConnectionString;
                con.Open();
                var trans = con.BeginTransaction();

                try
                {
                    var affected = con.Execute(queryText, param, trans);

                    RemoveLinkedData(config.Name, ids);

                    trans.Commit();

                    _eventLogService.AddDbQueryLog(EventLogCategory.DB_SUCCESS, name, queryText, param, $"{affected} rows affected.");

                    // run after saved event
                    AfterSaved(new EventActionModel()
                    {
                        EventName = "After Deleting",
                        EventSection = config.Name,
                        EventConfig = detailConfig.DeletingForm.AfterSaved,
                        Username = AppUser.ParseUsername(_httpContextAccessor.HttpContext.User.Identity.Name).Username,
                        ConnectionString = config.DataSourceConnection.ConnectionString
                    }, new Dictionary<string, object>() { { dataSourceConfig.IdColumn, ids } });
                }
                catch (Exception ex)
                {
                    trans.Rollback();

                    _eventLogService.AddDbQueryLog(EventLogCategory.DB_ERROR, name, queryText, param, ex.Message);
                    _logger.LogError(ex.Message, ex);
                    throw new DepException("An Error in the query has occurred: " + ex.Message);
                }
            }

            return true;
        }

        private void AssignComputedValues(List<FormFieldConfig> formFields, Dictionary<string, object> model, DbConnection con)
        {
            var username = AppUser.ParseUsername(_httpContextAccessor.HttpContext.User.Identity.Name).Username;
            var currentUser = _depDbContext.Users.FirstOrDefault(x => x.Username == username);

            foreach (var field in formFields)
            {
                if (!model.Keys.Contains(field.key) || model[field.key] == null)
                {
                    // model value doesn't exist or is null, check if it is computed field
                    if (field.computedConfig != null)
                    {
                        if (!string.IsNullOrEmpty(field.computedConfig.queryText))
                        {
                            var query = _queryBuilder.ProcessQueryWithParamters(field.computedConfig.queryText, model);
                            try
                            {
                                var value = con.ExecuteScalar(query.Item1, query.Item2, null, null, field.computedConfig.type);
                                SetModelValue(model, field.key, value);
                                _eventLogService.AddDbQueryLog(EventLogCategory.DB_SUCCESS, "Get Computed Value", query.Item1, query.Item2);
                            }
                            catch (Exception ex)
                            {
                                _eventLogService.AddDbQueryLog(EventLogCategory.DB_ERROR, "Get Computed Value", query.Item1, query.Item2, ex.Message);
                                _logger.LogError(ex.Message, ex);
                                throw new DepException($"An Error has occurred when calculate computed value for field: {field.key}. Error: {ex.Message}");
                            }
                        }
                        else
                        {
                            if (field.computedConfig.name == ComputedValueName.CurrentDateTime)
                            {
                                SetModelValue(model, field.key, DateTime.UtcNow);
                            }
                            if (field.computedConfig.name == ComputedValueName.CurrentUserGuid)
                            {
                                SetModelValue(model, field.key, currentUser.Id);
                            }
                            if (field.computedConfig.name == ComputedValueName.CurrentUserName)
                            {
                                SetModelValue(model, field.key, currentUser.Username);
                            }
                            if (field.computedConfig.name == ComputedValueName.CurrentUserId)
                            {
                                SetModelValue(model, field.key, currentUser.UserId);
                            }
                            if (field.computedConfig.name == ComputedValueName.CurrentUserEmail)
                            {
                                SetModelValue(model, field.key, currentUser.Email);
                            }
                        }
                    }
                }
            }
        }

        private void SetModelValue(Dictionary<string, object> model, string key, object value)
        {
            if (model.Keys.Contains(key)) model[key] = value;
            else
                model.Add(key, value);
        }

        private void AfterSaved(EventActionModel actionConfig, Dictionary<string, object> model)
        {
            var eventConfig = actionConfig.EventConfig;

            if (eventConfig == null || string.IsNullOrEmpty(eventConfig.Script)) return;

            try
            {
                if (eventConfig.EventType == FormEventType.QueryText || eventConfig.EventType == FormEventType.QueryStoredProcedure)
                {
                    var commandType = eventConfig.EventType == FormEventType.QueryText ? CommandType.Text : CommandType.StoredProcedure;
                    var queryText = _queryBuilder.ReplaceQueryParamters(eventConfig.Script);
                    var param = _queryBuilder.GenerateDynamicParameter(model.AsEnumerable());

                    using (var con = _serviceProvider.GetRequiredService<DbConnection>())
                    {
                        con.ConnectionString = actionConfig.ConnectionString;

                        con.Execute(queryText, param, null, null, commandType);
                    }

                    _eventLogService.AddEventLog(new EventLogModel()
                    {
                        Category = EventLogCategory.INFO,
                        Section = actionConfig.EventSection,
                        Action = actionConfig.EventName,
                        Username = actionConfig.Username,
                        Details = queryText,
                        Params = param != null ? JsonSerializer.Serialize(param) : ""
                    });
                }

                if (eventConfig.EventType == FormEventType.CommandLine)
                {
                    var process = new Process();
                    process.StartInfo.WorkingDirectory = "";
                    process.StartInfo.WindowStyle = ProcessWindowStyle.Hidden;
                    process.StartInfo.FileName = "cmd.exe";
                    process.StartInfo.UseShellExecute = false;
                    process.StartInfo.CreateNoWindow = true;
                    process.StartInfo.RedirectStandardOutput = true;
                    process.StartInfo.RedirectStandardInput = true;
                    process.Start();

                    using (StreamWriter sw = process.StandardInput)
                    {
                        if (sw.BaseStream.CanWrite)
                        {
                            var cmds = eventConfig.Script.Split(new string[] { "\r", "\n", "\r\n" }, StringSplitOptions.RemoveEmptyEntries);
                            foreach (var cmd in cmds)
                            {
                                sw.WriteLine(cmd);
                            }
                        }
                    }

                    _eventLogService.AddEventLog(new EventLogModel()
                    {
                        Category = EventLogCategory.INFO,
                        Section = actionConfig.EventSection,
                        Action = actionConfig.EventName,
                        Username = actionConfig.Username,
                        Details = eventConfig.Script
                    });

                }
            }
            catch (Exception ex)
            {
                _eventLogService.AddEventLog(new EventLogModel()
                {
                    Category = EventLogCategory.Error,
                    Section = actionConfig.EventSection,
                    Action = actionConfig.EventName,
                    Username = actionConfig.Username,
                    Details = JsonSerializer.Serialize(eventConfig),
                    Params = JsonSerializer.Serialize(model),
                    Result = ex.Message
                });
                _logger.LogError(ex.Message, ex);
            }
        }

        #endregion

        #region File upload API

        private List<UploadedFileMeta> ProcessFileUploadFileds(List<FormFieldConfig> formFields, Dictionary<string, object> model)
        {
            var result = new List<UploadedFileMeta>();
            var fileUploadFields = formFields.Where(x => x.type == "attachments").ToList();
            foreach (var field in fileUploadFields)
            {
                if (model.ContainsKey(field.key))
                {
                    var jsonOptions = new JsonSerializerOptions() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
                    var jsonElement = (JsonElement)model[field.key];
                    if (jsonElement.ValueKind == JsonValueKind.Array || jsonElement.ValueKind == JsonValueKind.String)
                    {
                        result.Add(new UploadedFileMeta()
                        {
                            FieldName = field.key,
                            UploadedFiles = JsonSerializer.Deserialize<List<UploadedFileModel>>(jsonElement.ToString(), jsonOptions)
                        });
                    }
                    model[field.key] = null;
                }
            }
            return result;
        }

        private void SaveUploadedFiles(List<UploadedFileMeta> uploadedFileMeta, object dataId, string gridName)
        {
            var attachmentService = _serviceProvider.GetRequiredService<IAttachmentService>();
            foreach (var meta in uploadedFileMeta)
            {
                attachmentService.SaveUploadedFiles(meta, dataId, gridName);
            }
        }

        private IEnumerable<GridColConfig> GetAttachmentCols(UniversalGridConfiguration config)
        {
            return _memoryCache.GetOrCreate($"grid.{config.Name}.attachment.cols", entry =>
            {
                entry.SetSlidingExpiration(TimeSpan.FromMinutes(30));
                var columnsConfig = JsonSerializer.Deserialize<List<GridColConfig>>(config.ColumnsConfig);
                return columnsConfig.Where(x => x.filterType == "attachments").Select(x =>
                {
                    if (x.fileUploadConfig == null)
                    {
                        x.fileUploadConfig = _attachmentService.GetDefaultConfig();
                        var datasourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);
                        x.fileUploadConfig.ForeignKeyName = datasourceConfig.IdColumn;
                    }
                    return x;
                });
            });
        }

        #endregion

        #region Linked Data API

        public GridData GetLinkedTableDataForFieldControl(string table1Name, GridParam gridParam)
        {
            var linkedTableInfo = GetLinkedTableInfo(table1Name);
            gridParam.IndexCount = 0;
            return GetGridData(linkedTableInfo.Table2Name, gridParam);
        }
        public dynamic GetLinkedTableConfigForFieldControl(string table1Name)
        {
            // get table2 info
            var linkedTableInfo = GetLinkedTableInfo(table1Name);

            var linkedDataSourceConfig = JsonSerializer.Deserialize<LinkedDataSourceConfig>(linkedTableInfo.DataSourceConfig);
            var columnsForLinkedField = linkedDataSourceConfig.PrimaryTable.Id == linkedTableInfo.Table2Id
                ? linkedDataSourceConfig.PrimaryTable.ColumnsForLinkedField
                : linkedDataSourceConfig.SecondaryTable.ColumnsForLinkedField;
            var columns = GetGridColumnsConfig(linkedTableInfo.Table2Name);

            return new
            {
                columns = columns.Where(c => columnsForLinkedField.Contains(c.field)).ToList(),
                dataKey = linkedTableInfo.LinkedTable.IdColumn
            };
        }

        public IEnumerable<object> GetLinkedDataIdsForList(string table1Name, string table2Id)
        {
            var linkedTableInfo = GetLinkedTableInfo(table1Name);

            var filters = new List<FilterParam>() {
                new FilterParam() {
                    field = linkedTableInfo.Table2MappingField,
                    value = table2Id,
                    matchMode = "equals"
                }
            };

            var linkedData = GetGridData(linkedTableInfo.Name, new GridParam() { IndexCount = -1, Filters = filters });
            var savedTable1Ids = linkedData.Data.Select(x => x[linkedTableInfo.Table1MappingField]);

            return savedTable1Ids;
        }
        public dynamic GetLinkedGridConfig(string name)
        {
            var item = _depDbContext.SiteMenus.Where(x => x.Name == name).FirstOrDefault();
            if (item == null) throw new DepException($"Portal Item with name:{name} deosn't exists");

            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == name);
            if (config == null) throw new DepException("Grid configuration does not exists with name: " + name);

            // get query text for list data from grid config.
            var dataSourceConfig = JsonSerializer.Deserialize<LinkedDataSourceConfig>(config.DataSourceConfig);
            var primary = _depDbContext.SiteMenus.Where(x => x.ParentId == item.Id && x.Id == dataSourceConfig.PrimaryTable.Id).FirstOrDefault();
            var secondary = _depDbContext.SiteMenus.Where(x => x.ParentId == item.Id && x.Id == dataSourceConfig.SecondaryTable.Id).FirstOrDefault();

            return new
            {
                PrimaryTableName = primary != null ? primary.Name : null,
                SecondaryTableName = secondary != null ? secondary.Name : null
            };
        }

        private LinkedTableInfo GetLinkedTableInfo(string table1Name)
        {
            var queryTables = from u in _depDbContext.UniversalGridConfigurations.Include(x => x.DataSourceConnection)
                              join m in _depDbContext.SiteMenus on u.Name equals m.Name
                              select new { m, u };

            var queryTable1 = queryTables.Where(t => t.m.Name == table1Name && t.u.ItemType == GridItemType.LINKED_SINGLE);

            var queryTable2 = from t in queryTables
                              join t1 in queryTable1 on t.m.ParentId equals t1.m.ParentId
                              where t.u.ItemType == GridItemType.LINKED_SINGLE && t.u.Name != table1Name
                              select t;

            var resultQuery = from t2 in queryTable2
                              join tMain in queryTables on t2.m.ParentId equals tMain.m.Id
                              select new LinkedTableInfo
                              {
                                  Table2Name = t2.m.Name,
                                  Table2Id = t2.m.Id,
                                  Id = tMain.m.Id,
                                  Name = tMain.m.Name,
                                  ConnectionString = tMain.u.DataSourceConnection.ConnectionString,
                                  DataSourceConfig = tMain.u.DataSourceConfig
                              };
            var result = resultQuery.FirstOrDefault();

            var config = JsonSerializer.Deserialize<LinkedDataSourceConfig>(result.DataSourceConfig);
            result.LinkedTable = config.LinkedTable;
            result.Table1MappingField = config.PrimaryTable.Id == result.Table2Id
                ? config.SecondaryTable.MapToLinkedTableField
                : config.PrimaryTable.MapToLinkedTableField;
            result.Table2MappingField = config.PrimaryTable.Id == result.Table2Id
                ? config.PrimaryTable.MapToLinkedTableField
                : config.SecondaryTable.MapToLinkedTableField;

            return result;
        }
        private List<RelationDataModel> GetLinkDataModelForForm(string table1Name, object table1Id)
        {
            var linkedTableInfo = GetLinkedTableInfo(table1Name);

            List<RelationDataModel> relationData = new List<RelationDataModel>();
            if (table1Id != null)
            {
                var filters = new List<FilterParam>() {
                    new FilterParam() {
                        field = linkedTableInfo.Table1MappingField,
                        value = table1Id,
                        matchMode = "equals"
                    }
                };

                var linkedData = GetGridData(linkedTableInfo.Name, new GridParam() { IndexCount = -1, Filters = filters });
                relationData = linkedData.Data.Select(x => new RelationDataModel()
                {
                    Id = x[linkedTableInfo.LinkedTable.IdColumn],
                    Table1Id = table1Id,
                    Table2Id = x[linkedTableInfo.Table2MappingField]
                }).ToList();
            }

            return relationData;
        }
        private List<RelationDataModel> ProcessLinkDataField(Dictionary<string, object> model)
        {
            List<RelationDataModel> result = null;
            if (model.ContainsKey(Constants.LINK_DATA_FIELD_NAME) && model[Constants.LINK_DATA_FIELD_NAME] != null)
            {
                var jsonOptions = new JsonSerializerOptions() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
                var jsonElement = (JsonElement)model[Constants.LINK_DATA_FIELD_NAME];
                if (jsonElement.ValueKind == JsonValueKind.Array || jsonElement.ValueKind == JsonValueKind.String)
                {
                    var valueStr = jsonElement.ToString();
                    result = JsonSerializer.Deserialize<List<RelationDataModel>>(valueStr, jsonOptions);
                    model[Constants.LINK_DATA_FIELD_NAME] = null;
                }
            }
            return result;
        }
        private void UpdateLinkData(string table1Name, object table1Id, List<RelationDataModel> inputModel)
        {
            var existingModel = GetLinkDataModelForForm(table1Name, table1Id);

            var linkedTableInfo = GetLinkedTableInfo(table1Name);

            var columns = new List<string>() { linkedTableInfo.Table1MappingField, linkedTableInfo.Table2MappingField };

            using (var con = _serviceProvider.GetRequiredService<DbConnection>())
            {
                con.ConnectionString = linkedTableInfo.ConnectionString;
                //var trans = con.BeginTransaction();

                try
                {
                    var toAdd = inputModel
                        .Where(input => existingModel.All(existing => !(existing.Table1Id == input.Table1Id && existing.Table2Id == input.Table2Id)))
                        .Select(x => x.Table2Id);
                    if (toAdd.Any())
                    {
                        linkedTableInfo.LinkedTable.Columns = columns;
                        var sql = _queryBuilder.GenerateSqlTextForInsert(linkedTableInfo.LinkedTable);

                        foreach (var table2Id in toAdd)
                        {
                            var value = new List<KeyValuePair<string, object>>();
                            // if queryToGetId configured, get id first.
                            var queryToGetId = linkedTableInfo.LinkedTable.QueryToGetId;
                            if (queryToGetId != null && !string.IsNullOrEmpty(queryToGetId.queryText))
                            {
                                var idValue = con.ExecuteScalar(queryToGetId.queryText, null, null, null, queryToGetId.type);
                                value.Add(new KeyValuePair<string, object>(linkedTableInfo.LinkedTable.IdColumn, idValue));
                            }
                            value.Add(new KeyValuePair<string, object>(linkedTableInfo.Table1MappingField, table1Id));
                            value.Add(new KeyValuePair<string, object>(linkedTableInfo.Table2MappingField, table2Id));
                            var dynamicParameters = new DynamicParameters(_queryBuilder.GenerateDynamicParameter(value));
                            var paramReturnId = _queryBuilder.ParameterName($"RETURNED_{linkedTableInfo.LinkedTable.IdColumn}");
                            dynamicParameters.Add(paramReturnId, dbType: DbType.String, direction: ParameterDirection.Output, size: 40);

                            con.Execute(sql, dynamicParameters);
                        }
                    }

                    var toDelete = existingModel
                        .Where(existing => inputModel.All(input => !(input.Table1Id == existing.Table1Id && input.Table2Id == existing.Table2Id)))
                        .Select(x => x.Id);
                    if (toDelete.Any())
                    {
                        var deleteSql = _queryBuilder.GenerateSqlTextForDelete(linkedTableInfo.LinkedTable);
                        var deleteParam = _queryBuilder.GenerateDynamicParameter(
                            new List<KeyValuePair<string, object>>() {
                        new KeyValuePair<string, object>(linkedTableInfo.LinkedTable.IdColumn, toDelete)
                            });
                        con.Execute(deleteSql, deleteParam);
                    }
                    //trans.Commit();
                }
                catch (Exception ex)
                {
                    //trans.Rollback();
                    _logger.LogError(ex.Message, ex);
                    throw;
                }
            }
        }
        private void RemoveLinkedData(string table1Name, string[] table1Ids)
        {
            var linkedTableInfo = GetLinkedTableInfo(table1Name);

            List<RelationDataModel> relationData = new List<RelationDataModel>();
            if (table1Ids.Any())
            {
                var filters = new List<FilterParam>() {
                    new FilterParam() {
                        field = linkedTableInfo.Table1MappingField,
                        value = table1Ids,
                        matchMode = "in"
                    }
                };
                var linkedData = GetGridData(linkedTableInfo.Name, new GridParam() { IndexCount = -1, Filters = filters });
                var ids = linkedData.Data.Select(x => x[linkedTableInfo.LinkedTable.IdColumn].ToString()).ToList();

                var queryText = _queryBuilder.GenerateSqlTextForDelete(linkedTableInfo.LinkedTable);
                var param = _queryBuilder.GenerateDynamicParameter(
                        new List<KeyValuePair<string, object>>() {
                            new KeyValuePair<string, object>(linkedTableInfo.LinkedTable.IdColumn, ids)
                            }
                        );
                try
                {
                    using (var con = _serviceProvider.GetRequiredService<DbConnection>())
                    {
                        con.ConnectionString = linkedTableInfo.ConnectionString;
                        con.Open();
                        con.Execute(queryText, param);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.Message, ex);
                }
            }
        }

        #endregion

    }

    class LinkedTableInfo
    {
        public string Table2Name { get; set; }
        public Guid Table2Id { get; set; }
        public string Name { get; set; }
        public Guid Id { get; set; }

        public string ConnectionString { get; set; }
        public DataSourceConfig LinkedTable { get; set; }
        public string DataSourceConfig { get; set; }
        public string Table2MappingField { get; set; }
        public string Table1MappingField { get; set; }
    }
}