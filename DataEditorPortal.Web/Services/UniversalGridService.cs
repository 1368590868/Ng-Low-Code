using AutoMapper;
using Dapper;
using DataEditorPortal.Data.Common;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Models;
using DataEditorPortal.Web.Models.UniversalGrid;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using OfficeOpenXml;
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
        string CurrentUsername { get; set; }
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
        bool OnValidateGridData(string name, string type, string id, IDictionary<string, object> model);
        bool UpdateGridData(string name, string id, IDictionary<string, object> model);
        bool AddGridData(string name, IDictionary<string, object> model);
        bool DeleteGridData(string name, object[] ids);

        // file upload api
        IEnumerable<GridColConfig> GetAttachmentCols(UniversalGridConfiguration config);

        // linked table api
        dynamic GetLinkedGridConfig(string name);
        GridData GetLinkedTableDataForFieldControl(string table1Name, GridParam param);
        dynamic GetLinkedTableConfigForFieldControl(string tableName);
        IEnumerable<object> GetLinkedDataIdsForList(string table1Name, string table2Id);
        LinkedTableInfo GetLinkedTableInfo(string table1Name);

        // utility
        UniversalGridConfiguration GetUniversalGridConfiguration(string name);
        GridFormLayout GetAddingFormConfig(UniversalGridConfiguration config);
        GridFormLayout GetUpdatingFormConfig(UniversalGridConfiguration config);
        IEnumerable<object> CheckDataExists(string name, object[] ids);
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

        public string CurrentUsername { get; set; }

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
            _attachmentService = attachmentService;
            _memoryCache = memoryCache;

            if (_httpContextAccessor.HttpContext != null && _httpContextAccessor.HttpContext.User != null)
                CurrentUsername = AppUser.ParseUsername(_httpContextAccessor.HttpContext.User.Identity.Name).Username;

            _eventLogService = eventLogService;
            _eventLogService.CurrentUsername = CurrentUsername;
        }

        #region Grid cofnig, columns config, search config and detail form config

        public GridConfig GetGridConfig(string name)
        {
            var item = _depDbContext.SiteMenus.Where(x => x.Name == name).FirstOrDefault();
            if (item == null) throw new DepException($"Portal Item with name:{name} deosn't exists");

            var config = GetUniversalGridConfiguration(name);

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
            var config = GetUniversalGridConfiguration(name);

            if (string.IsNullOrEmpty(config.ColumnsConfig)) config.ColumnsConfig = "[]";

            return JsonSerializer.Deserialize<List<GridColConfig>>(config.ColumnsConfig).Where(x => !x.hidden).ToList();
        }

        public List<SearchFieldConfig> GetGridSearchConfig(string name)
        {
            var config = GetUniversalGridConfiguration(name);

            if (string.IsNullOrEmpty(config.SearchConfig)) config.SearchConfig = "[]";

            var result = JsonSerializer.Deserialize<List<SearchFieldConfig>>(config.SearchConfig);

            result.ForEach(x => x.searchRule = null);

            return result;
        }

        public List<FormFieldConfig> GetGridFormConfig(string name, string type)
        {
            var config = GetUniversalGridConfiguration(name);

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
            var config = GetUniversalGridConfiguration(name);

            if (string.IsNullOrEmpty(config.DetailConfig)) throw new DepException("Grid Detail Config can not be empty.");

            var detailConfig = JsonSerializer.Deserialize<DetailConfig>(config.DetailConfig);

            type = type.ToLower();
            var formLayout = type == "add" ? detailConfig.AddingForm : type == "update" ? detailConfig.UpdatingForm : type == "delete" ? detailConfig.DeletingForm : null;

            if (formLayout != null)
            {
                // do not send query text to front end.
                if (formLayout.OnValidate != null && formLayout.OnValidate.EventType != FormEventType.Javascript) formLayout.OnValidate.Script = null;
                // if event config is not javascript, do not send to front end.
                if (formLayout.AfterSaved != null && formLayout.AfterSaved.EventType != FormEventType.Javascript) formLayout.AfterSaved = null;
                return new GridFormLayout() { OnValidate = formLayout.OnValidate, AfterSaved = formLayout.AfterSaved };
            }
            else return null;
        }

        #endregion

        #region Grid List data
        public GridData GetGridData(string name, GridParam param)
        {
            var config = GetUniversalGridConfiguration(name);

            #region compose the query text

            // get query text for list data from grid config.
            var dataSourceConfig = _memoryCache.GetOrCreate($"grid.{name}.datasource", entry =>
            {
                entry.SetSlidingExpiration(TimeSpan.FromMinutes(30));
                var result = new DataSourceConfig();
                if (config.ItemType == GridItemType.LINKED)
                {
                    var linkedDataSourceConfig = JsonSerializer.Deserialize<LinkedDataSourceConfig>(config.DataSourceConfig);
                    result = linkedDataSourceConfig.LinkTable;
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

            // join attachments 
            var attachmentCols = GetAttachmentCols(config);
            if (attachmentCols.Any())
                queryText = _queryBuilder.JoinAttachments(queryText, attachmentCols);

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
                    var index = 0;
                    foreach (var key in row.Keys)
                    {
                        row[key] = _queryBuilder.TransformValue(row[key], schema.Rows[index]);
                        index++;
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

        public List<DropdownOptionsItem> GetGridColumnFilterOptions(string name, string column)
        {
            var config = GetUniversalGridConfiguration(name);

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

        #endregion

        #region Export Grid Data

        public MemoryStream ExportExcel(string name, ExportParam param)
        {
            var columns = GetGridColumnsConfig(name).Where(x => x.type == "DataBaseField").ToList();
            var result = GetGridData(name, param);

            var stream = new MemoryStream();
            using (var p = new ExcelPackage(stream))
            {
                var ws = p.Workbook.Worksheets.Add("Data");

                var headerRange = ws.Cells[1, 1, 1, columns.Count];
                headerRange.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                headerRange.Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                headerRange.Style.Fill.BackgroundColor.SetColor(System.Drawing.ColorTranslator.FromHtml($"#ccc"));
                headerRange.Style.Font.Size = 11;
                headerRange.Style.Font.Bold = true;
                headerRange.Style.WrapText = true;
                ws.Row(1).Height = 30;

                var rowIndex = 1;
                foreach (var row in result.Data)
                {
                    var columnIndex = 1;
                    foreach (var column in columns)
                    {
                        if (rowIndex == 1)
                        {
                            ws.Column(columnIndex).Width = 20;
                            ws.Column(columnIndex).AutoFit(20);
                            ws.Cells[rowIndex, columnIndex].Value = column.header;
                        }

                        SetExcelCellValue(ws.Cells[rowIndex + 1, columnIndex], column, row[column.field]);
                        columnIndex++;
                    }
                    rowIndex++;
                }

                var range = ws.Cells[1, 1, result.Data.Count, columns.Count];
                range.AutoFilter = true;

                ws.View.ShowGridLines = true;
                ws.View.FreezePanes(2, 1);

                p.Save();
                p.Dispose();
            }

            stream.Seek(0, SeekOrigin.Begin);
            return stream;
        }

        private void SetExcelCellValue(ExcelRange range, GridColConfig column, object value)
        {
            if (column.filterType == "boolean")
            {
                range.Value = (bool)value ? "Yes" : "No";
                range.Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            }
            else if (column.filterType == "numeric")
            {
                if (value != null)
                {
                    decimal tmpVal;
                    if (decimal.TryParse(value.ToString(), out tmpVal))
                    {
                        range.Value = tmpVal;

                        var maxFractionDigits = 2;
                        if (!string.IsNullOrEmpty(column.format))
                        {
                            var format = column.format.Split(new char[] { '.', '-', ' ' }, StringSplitOptions.RemoveEmptyEntries);
                            if (format.Length == 2) int.TryParse(format[format.Length - 1], out maxFractionDigits);
                        }
                        var digits = "".PadRight(maxFractionDigits, '0');
                        range.Style.Numberformat.Format = digits.Length > 0 ? $"#,##0.{digits}" : "#,##0";
                    }
                }
            }
            else if (column.filterType == "date")
            {
                if (value != null)
                {
                    DateTime tmpVal;
                    if (DateTime.TryParse(value.ToString(), out tmpVal))
                    {
                        range.Value = tmpVal.ToOADate();
                        range.Style.Numberformat.Format = "mm-dd-yyyy"; //or m/d/yy h:mm
                    }
                }
            }
            else
            {
                range.Value = value;
            }
        }

        #endregion

        #region Grid detail, add, update and remove

        public IDictionary<string, object> GetGridDataDetail(string name, string id)
        {
            var config = GetUniversalGridConfiguration(name);

            // get query text for list data from grid config.
            var dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);
            var queryText = _queryBuilder.GenerateSqlTextForDetail(dataSourceConfig);

            // join attachments 
            var attachmentCols = GetAttachmentCols(config);
            if (attachmentCols.Any())
                queryText = _queryBuilder.JoinAttachments(queryText, attachmentCols);

            IDictionary<string, object> details = new Dictionary<string, object>();
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
                    details = (IDictionary<string, object>)con.QueryFirst(queryText, param);
                    foreach (var key in details.Keys)
                    {
                        var index = details.Keys.ToList().IndexOf(key);
                        details[key] = _queryBuilder.TransformValue(details[key], schema.Rows[index]);
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

            // process value if required
            var result = details.AsList().ToDictionary(x => x.Key, x => x.Value);
            var formLayout = GetUpdatingFormConfig(config);
            var factory = _serviceProvider.GetRequiredService<IValueProcessorFactory>();
            foreach (var field in formLayout.FormFields)
            {
                var processor = factory.CreateValueProcessor(field.filterType);
                if (processor != null)
                {
                    processor.FetchValue(config, field, id, result);
                }
            }

            return result;
        }

        public bool OnValidateGridData(string name, string type, string id, IDictionary<string, object> model)
        {
            var config = GetUniversalGridConfiguration(name);

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

                // drop the keyvalue which not in formfield defination
                model = model.ToList()
                    .Where(kv => formLayout.FormFields.Any(f => kv.Key == f.key))
                    .ToDictionary(x => x.Key, x => x.Value);

                // add Id parameters
                if (model.ContainsKey(dataSourceConfig.IdColumn))
                    model[dataSourceConfig.IdColumn] = id;
                else
                    model.Add(dataSourceConfig.IdColumn, id);

                // calculate the computed field values
                ProcessComputedValues(formLayout.FormFields, model, con);

                // use value processor to convert values in model
                var factory = _serviceProvider.GetRequiredService<IValueProcessorFactory>();
                var valueProcessors = new List<ValueProcessorBase>();
                foreach (var field in formLayout.FormFields)
                {
                    var processor = factory.CreateValueProcessor(field.filterType);
                    if (processor != null)
                    {
                        processor.PreProcess(config, field, model);
                        valueProcessors.Add(processor);
                    }
                }

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

        public bool AddGridData(string name, IDictionary<string, object> model)
        {
            var config = GetUniversalGridConfiguration(name);

            // get query text for list data from grid config.
            var dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);

            // get detail config
            var formLayout = GetAddingFormConfig(config);
            using (var con = _serviceProvider.GetRequiredService<DbConnection>())
            {
                con.ConnectionString = config.DataSourceConnection.ConnectionString;
                con.Open();

                #region prepair values and params
                // drop the keyvalue which not in formfield defination
                model = model.ToList()
                    .Where(kv => formLayout.FormFields.Any(f => kv.Key == f.key))
                    .ToDictionary(x => x.Key, x => x.Value);

                // calculate the computed field values
                ProcessComputedValues(formLayout.FormFields, model, con);

                // use value processor to convert values in model
                var factory = _serviceProvider.GetRequiredService<IValueProcessorFactory>();
                var valueProcessors = new List<ValueProcessorBase>();
                foreach (var field in formLayout.FormFields)
                {
                    var processor = factory.CreateValueProcessor(field.filterType);
                    if (processor != null)
                    {
                        processor.PreProcess(config, field, model);
                        valueProcessors.Add(processor);
                    }
                }

                // generate the query text and parameters
                var queryText = _queryBuilder.GenerateSqlTextForInsert(new DataSourceConfig()
                {
                    IdColumn = dataSourceConfig.IdColumn,
                    TableSchema = dataSourceConfig.TableSchema,
                    TableName = dataSourceConfig.TableName,
                    Columns = model.Keys.ToList(),
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

                    // use value processors to execute extra operations
                    foreach (var processor in valueProcessors)
                    {
                        processor.PostProcess(returnedId);
                    }

                    trans.Commit();

                    _eventLogService.AddDbQueryLog(EventLogCategory.DB_SUCCESS, name, queryText, param, $"{affected} rows affected.");

                    // run after saved event handler
                    if (formLayout?.AfterSaved != null)
                    {
                        AfterSaved(new EventActionModel()
                        {
                            EventName = "After Inserting",
                            EventSection = config.Name,
                            EventConfig = formLayout.AfterSaved,
                            Username = CurrentUsername,
                            ConnectionString = config.DataSourceConnection.ConnectionString
                        }, model);
                    }
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

        public bool UpdateGridData(string name, string id, IDictionary<string, object> model)
        {
            var config = GetUniversalGridConfiguration(name);

            // get query text for list data from grid config.
            var dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);

            // get detail config
            var formLayout = GetUpdatingFormConfig(config);

            using (var con = _serviceProvider.GetRequiredService<DbConnection>())
            {
                con.ConnectionString = config.DataSourceConnection.ConnectionString;
                con.Open();

                #region prepair values and paramsters
                // drop the keyvalue which not in formfield defination
                model = model.ToList()
                    .Where(kv => formLayout.FormFields.Any(f => kv.Key == f.key))
                    .ToDictionary(x => x.Key, x => x.Value);

                // calculate the computed field values
                ProcessComputedValues(formLayout.FormFields, model, con);

                // use value processor to convert values in model
                var factory = _serviceProvider.GetRequiredService<IValueProcessorFactory>();
                var valueProcessors = new List<ValueProcessorBase>();
                foreach (var field in formLayout.FormFields)
                {
                    var processor = factory.CreateValueProcessor(field.filterType);
                    if (processor != null)
                    {
                        processor.PreProcess(config, field, model);
                        valueProcessors.Add(processor);
                    }
                }

                // generate the query text
                var queryText = _queryBuilder.GenerateSqlTextForUpdate(new DataSourceConfig()
                {
                    TableSchema = dataSourceConfig.TableSchema,
                    TableName = dataSourceConfig.TableName,
                    IdColumn = dataSourceConfig.IdColumn,
                    Columns = model.Keys.ToList(),
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

                    // use value processors to execute extra operations
                    foreach (var processor in valueProcessors)
                    {
                        processor.PostProcess(id);
                    }

                    trans.Commit();

                    _eventLogService.AddDbQueryLog(EventLogCategory.DB_SUCCESS, name, queryText, param, $"{affected} rows affected.");

                    // run after saved event
                    if (formLayout?.AfterSaved != null)
                    {
                        AfterSaved(new EventActionModel()
                        {
                            EventName = "After Updating",
                            EventSection = config.Name,
                            EventConfig = formLayout.AfterSaved,
                            Username = CurrentUsername,
                            ConnectionString = config.DataSourceConnection.ConnectionString
                        }, model);
                    }
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

        public bool DeleteGridData(string name, object[] ids)
        {
            var config = GetUniversalGridConfiguration(name);

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

            var fields = new List<FormFieldConfig>();
            GetAddingFormConfig(config).FormFields.ForEach(x => { if (!fields.Any(x => x.key == x.key)) fields.Add(x); });
            GetUpdatingFormConfig(config).FormFields.ForEach(x => { if (!fields.Any(x => x.key == x.key)) fields.Add(x); });

            // use value processor to convert values in model
            var factory = _serviceProvider.GetRequiredService<IValueProcessorFactory>();
            var valueProcessors = new List<ValueProcessorBase>();
            foreach (var field in fields)
            {
                var processor = factory.CreateValueProcessor(field.filterType);
                if (processor != null)
                {
                    processor.BeforeDeleted(config, field, ids);
                    valueProcessors.Add(processor);
                }
            }

            using (var con = _serviceProvider.GetRequiredService<DbConnection>())
            {
                con.ConnectionString = config.DataSourceConnection.ConnectionString;
                con.Open();
                var trans = con.BeginTransaction();

                try
                {
                    var affected = con.Execute(queryText, param, trans);

                    // use value processors to execute extra operations
                    foreach (var processor in valueProcessors)
                    {
                        processor.AfterDeleted();
                    }

                    trans.Commit();

                    _eventLogService.AddDbQueryLog(EventLogCategory.DB_SUCCESS, name, queryText, param, $"{affected} rows affected.");

                    // run after saved event
                    if (detailConfig.DeletingForm?.AfterSaved != null)
                    {
                        AfterSaved(new EventActionModel()
                        {
                            EventName = "After Deleting",
                            EventSection = config.Name,
                            EventConfig = detailConfig.DeletingForm?.AfterSaved,
                            Username = CurrentUsername,
                            ConnectionString = config.DataSourceConnection.ConnectionString
                        }, new Dictionary<string, object>() { { dataSourceConfig.IdColumn, ids } });
                    }
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

        private void ProcessComputedValues(List<FormFieldConfig> formFields, IDictionary<string, object> model, DbConnection con)
        {
            var currentUser = _depDbContext.Users.FirstOrDefault(x => x.Username == CurrentUsername);

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
                    else
                    {
                        // It is not a computed field, but it is added in form config without value in model.
                        // Give it null value in order to generate a parameter for custom query text. 
                        SetModelValue(model, field.key, null);
                    }
                }
            }
        }

        private void SetModelValue(IDictionary<string, object> model, string key, object value)
        {
            if (model.Keys.Contains(key)) model[key] = value;
            else
                model.Add(key, value);
        }

        private void AfterSaved(EventActionModel actionConfig, IDictionary<string, object> model)
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

        public IEnumerable<GridColConfig> GetAttachmentCols(UniversalGridConfiguration config)
        {
            return _memoryCache.GetOrCreate($"grid.{config.Name}.attachment.cols", entry =>
            {
                entry.SetSlidingExpiration(TimeSpan.FromMinutes(30));

                if (string.IsNullOrEmpty(config.ColumnsConfig)) return new List<GridColConfig>();

                var columnsConfig = JsonSerializer.Deserialize<List<GridColConfig>>(config.ColumnsConfig);
                return columnsConfig.Where(x => x.type == "AttachmentField" && x.filterType == "attachments").Select(x =>
                {
                    if (x.fileUploadConfig == null)
                    {
                        x.fileUploadConfig = _attachmentService.GetDefaultConfig();
                        var datasourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);
                        x.fileUploadConfig.FieldMapping.Add("REFERENCE_DATA_KEY", datasourceConfig.IdColumn);
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
            return GetGridData(linkedTableInfo.Table2.Name, gridParam);
        }
        public dynamic GetLinkedTableConfigForFieldControl(string table1Name)
        {
            var linkedTableInfo = GetLinkedTableInfo(table1Name);
            var columns = GetGridColumnsConfig(linkedTableInfo.Table2.Name);

            return new
            {
                columns = columns.Where(c => linkedTableInfo.Table2.EditorColumns.Contains(c.field)).ToList(),
                dataKey = linkedTableInfo.Table2.IdColumn,
                table2Name = linkedTableInfo.Table2.Name
            };
        }

        /// <summary>
        /// Get Values of IdColumn of Table1, which has linked to the value of IdColumn of table2, according to  the foreign key configuration
        /// </summary>
        /// <param name="table1Name">table1 Name</param>
        /// <param name="table2Id">Selected Value of IdColumn of table2</param>
        /// <returns>Values of IdColumn of Table1 that linked to table2Id</returns>
        public IEnumerable<object> GetLinkedDataIdsForList(string table1Name, string table2Id)
        {
            var linkedTableInfo = GetLinkedTableInfo(table1Name);

            var queryText = linkedTableInfo.Table2.Query_GetLinkedDataById;
            var param = _queryBuilder.GenerateDynamicParameter(new Dictionary<string, object>() { { linkedTableInfo.Table2.IdColumn, table2Id } });

            var table1Ids = Enumerable.Empty<object>();
            try
            {
                using (var con = _serviceProvider.GetRequiredService<DbConnection>())
                {
                    con.ConnectionString = linkedTableInfo.LinkTable.ConnectionString;
                    con.Open();
                    var datas = con.Query(queryText, param);

                    table1Ids = datas.Select(data =>
                    {
                        var item = (IDictionary<string, object>)data;
                        return item[$"T1_{linkedTableInfo.Table1.IdColumn}"];
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message, ex);
            }

            return table1Ids;
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

        public LinkedTableInfo GetLinkedTableInfo(string table1Name)
        {
            return _memoryCache.GetOrCreate($"grid.{table1Name}.linked.table.info", entry =>
            {
                entry.SetSlidingExpiration(TimeSpan.FromMinutes(30));

                var queryTables = from u in _depDbContext.UniversalGridConfigurations.Include(x => x.DataSourceConnection)
                                  join m in _depDbContext.SiteMenus on u.Name equals m.Name
                                  select new { m, u };
                var queryMainId = queryTables.Where(t => t.m.Name == table1Name && t.u.ItemType == GridItemType.LINKED_SINGLE).Select(t => t.m.ParentId);
                var queryMainAndLinked = from t in queryTables
                                         where queryMainId.Contains(t.m.Id) || queryMainId.Contains(t.m.ParentId)
                                         select new
                                         {
                                             Name = t.m.Name,
                                             Id = t.m.Id,
                                             DataSource = t.u.DataSourceConfig,
                                             ConnectionString = t.u.DataSourceConnection.ConnectionString,
                                             ItemType = t.u.ItemType,
                                             Order = t.m.Order
                                         };
                var tables = queryMainAndLinked.ToList();

                var linkedDataSourceConfig = tables.Where(x => x.ItemType == GridItemType.LINKED).Select(t => t.DataSource).FirstOrDefault();
                var dsLink = JsonSerializer.Deserialize<LinkedDataSourceConfig>(linkedDataSourceConfig);

                var linkTable = tables.Where(x => x.ItemType == GridItemType.LINKED)
                .Select(t =>
                {
                    var ds = JsonSerializer.Deserialize<LinkedDataSourceConfig>(t.DataSource);
                    var query1 = _queryBuilder.GenerateSqlTextForDatasource(ds.LinkTable);
                    return new TableMeta()
                    {
                        Name = t.Name,
                        MenuId = t.Id,
                        IdColumn = ds.LinkTable.IdColumn,
                        Query_AllData = query1,
                        ConnectionString = t.ConnectionString
                    };
                }).FirstOrDefault();

                var primary = tables.Where(x => x.ItemType == GridItemType.LINKED_SINGLE)
                    .OrderBy(t => t.Order)
                    .Select(t =>
                    {
                        var ds = JsonSerializer.Deserialize<DataSourceConfig>(t.DataSource);
                        var query1 = _queryBuilder.GenerateSqlTextForDatasource(ds);
                        return new TableMeta()
                        {
                            Name = t.Name,
                            MenuId = t.Id,
                            IdColumn = ds.IdColumn,
                            Query_AllData = query1,
                            EditorColumns = dsLink.PrimaryTable.ColumnsForLinkedField,
                            ReferenceKey = dsLink.LinkTable.PrimaryReferenceKey,
                            ForeignKey = dsLink.LinkTable.PrimaryForeignKey,
                            ConnectionString = t.ConnectionString
                        };
                    })
                    .FirstOrDefault();

                var secondary = tables.Where(x => x.ItemType == GridItemType.LINKED_SINGLE)
                    .OrderByDescending(t => t.Order)
                    .Select(t =>
                    {
                        var ds = JsonSerializer.Deserialize<DataSourceConfig>(t.DataSource);
                        var query1 = _queryBuilder.GenerateSqlTextForDatasource(ds);
                        return new TableMeta()
                        {
                            Name = t.Name,
                            MenuId = t.Id,
                            IdColumn = ds.IdColumn,
                            Query_AllData = query1,
                            EditorColumns = dsLink.SecondaryTable.ColumnsForLinkedField,
                            ReferenceKey = dsLink.LinkTable.SecondaryReferenceKey,
                            ForeignKey = dsLink.LinkTable.SecondaryForeignKey,
                            ConnectionString = t.ConnectionString
                        };
                    })
                    .FirstOrDefault();

                primary.Query_GetLinkedDataById = _queryBuilder.GenerateSqlTextForLinkData(linkTable, primary, secondary);
                secondary.Query_GetLinkedDataById = _queryBuilder.GenerateSqlTextForLinkData(linkTable, secondary, primary);
                linkTable.Query_Insert = _queryBuilder.GenerateSqlTextForInsert(
                    new DataSourceConfig()
                    {
                        Columns = new List<string>() { primary.ForeignKey, secondary.ForeignKey },
                        TableName = dsLink.LinkTable.TableName,
                        TableSchema = dsLink.LinkTable.TableSchema,
                        IdColumn = dsLink.LinkTable.IdColumn,
                        QueryText = dsLink.LinkTable.QueryInsert
                    }
                );
                linkTable.Query_Delete = _queryBuilder.GenerateSqlTextForDelete(dsLink.LinkTable);

                var table1IsPrimary = primary.Name == table1Name;

                return new LinkedTableInfo()
                {
                    Table1 = table1IsPrimary ? primary : secondary,
                    Table2 = table1IsPrimary ? secondary : primary,
                    LinkTable = linkTable
                };
            });
        }

        #endregion

        #region utility methods

        public UniversalGridConfiguration GetUniversalGridConfiguration(string name)
        {
            var config = _memoryCache.GetOrCreate($"grid.{name}", entry =>
            {
                entry.SetSlidingExpiration(TimeSpan.FromMinutes(30));
                return _depDbContext.UniversalGridConfigurations.Include(x => x.DataSourceConnection).FirstOrDefault(x => x.Name == name);
            });
            if (config == null) throw new DepException("Grid configuration does not exists with name: " + name);
            return config;
        }

        public GridFormLayout GetAddingFormConfig(UniversalGridConfiguration config)
        {
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

            return detailConfig.AddingForm;
        }

        public GridFormLayout GetUpdatingFormConfig(UniversalGridConfiguration config)
        {
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

            return updatingForm;
        }

        #endregion

        public IEnumerable<object> CheckDataExists(string name, object[] ids)
        {
            var config = GetUniversalGridConfiguration(name);

            // get query text for list data from grid config.
            var dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);
            var queryText = _queryBuilder.GenerateSqlTextForExist(dataSourceConfig);

            var param = _queryBuilder.GenerateDynamicParameter(
                        new List<KeyValuePair<string, object>>() {
                            new KeyValuePair<string, object>(dataSourceConfig.IdColumn, ids)
                        }
                    );

            IEnumerable<object> result = null;
            using (var con = _serviceProvider.GetRequiredService<DbConnection>())
            {
                con.ConnectionString = config.DataSourceConnection.ConnectionString;
                con.Open();

                try
                {
                    DataTable schema;
                    using (var dr = con.ExecuteReader(queryText, param))
                    {
                        schema = dr.GetSchemaTable();
                    }
                    var data = con.Query(queryText, param);
                    result = data.Select(x =>
                    {
                        var row = (IDictionary<string, object>)x;
                        return _queryBuilder.TransformValue(row[dataSourceConfig.IdColumn], schema.Rows[0]);
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.Message, ex);
                }
            }

            return result;
        }
    }

}