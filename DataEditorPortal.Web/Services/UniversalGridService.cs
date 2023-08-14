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
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text.Json;

namespace DataEditorPortal.Web.Services
{
    public interface IUniversalGridService
    {
        string CurrentUsername { set; }
        GridConfig GetGridConfig(string name);
        List<GridColConfig> GetGridColumnsConfig(string name);
        List<DropdownOptionsItem> GetGridColumnFilterOptions(string name, string column);
        List<SearchFieldConfig> GetGridSearchConfig(string name);
        List<FormFieldConfig> GetGridFormConfig(string name, string type);
        GridFormLayout GetFormEventConfig(string name, string type);

        GridData GetGridData(string name, GridParam param);
        List<FilterParam> ProcessFilterParam(List<FilterParam> filters, List<FilterParam> filtersApplied);
        GridData QueryGridData(IDbConnection con, string queryText, object queryParams, string gridName, bool writeLog = false);
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
        GridData GetGridDataForFieldControl(string table1Name, GridParam param);
        dynamic GetRelationConfigForFieldControl(string tableName);
        IEnumerable<object> GetLinkedDataIdsForList(string table1Name, string table2Id);
        RelationInfo GetRelationInfo(string table1Name);

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
        private readonly IDapperService _dapperService;

        private string _currentUsername;
        public string CurrentUsername
        {
            set
            {
                _currentUsername = value;
                _dapperService.CurrentUsername = value;
                _eventLogService.CurrentUsername = value;
            }
        }

        public UniversalGridService(
            IServiceProvider serviceProvider,
            DepDbContext depDbContext,
            IQueryBuilder queryBuilder,
            ILogger<UniversalGridService> logger,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor,
            IEventLogService eventLogService,
            IAttachmentService attachmentService,
            IMemoryCache memoryCache,
            IDapperService dapperService)
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
            _dapperService = dapperService;

            if (_httpContextAccessor.HttpContext != null && _httpContextAccessor.HttpContext.User != null)
                CurrentUsername = AppUser.ParseUsername(_httpContextAccessor.HttpContext.User.Identity.Name).Username;
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
                if (detailConfig.AddingForm != null)
                {
                    result.AllowAdding = detailConfig.AddingForm.Enabled;
                    if (detailConfig.AddingForm.UseCustomForm)
                        result.CustomAddFormName = detailConfig.AddingForm.CustomFormName;
                }
                if (detailConfig.UpdatingForm != null)
                {
                    result.AllowEditing = detailConfig.UpdatingForm.Enabled;
                    if (detailConfig.UpdatingForm.UseCustomForm)
                        result.CustomEditFormName = detailConfig.UpdatingForm.CustomFormName;
                }
                //if (detailConfig.InfoForm != null)
                //{
                //    result.AllowAdding = detailConfig.InfoForm.Enabled;
                //    if (detailConfig.InfoForm.UseCustomForm)
                //        result.CustomViewFormName = detailConfig.InfoForm.CustomFormName;
                //}
                if (detailConfig.DeletingForm != null)
                {
                    result.AllowDeleting = detailConfig.DeletingForm.Enabled;
                    if (detailConfig.DeletingForm.UseCustomForm)
                        result.CustomDeleteFormName = detailConfig.DeletingForm.CustomFormName;
                }
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

            //result.ForEach(x => x.searchRule = null);

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
            _dapperService.EventSection = $"{name} | QueryGridData";

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
            if (param.Filters != null)
            {
                param.Filters.ForEach(filter =>
                {
                    if (filter.field == Constants.LINK_DATA_FIELD_NAME && filter.value != null)
                    {
                        filter.field = dataSourceConfig.IdColumn;
                        filter.matchMode = "in";
                        filter.value = GetLinkedDataIdsForList(name, filter.value.ToString()).ToList();
                    }
                });
            }
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
            using (var con = _serviceProvider.GetRequiredService<IDbConnection>())
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
                filter.index = filtersApplied.Count(x => x.field == filter.field);
                filtersApplied.Add(filter);
            };

            return filtersApplied;
        }

        public GridData QueryGridData(IDbConnection con, string queryText, object queryParams, string gridName, bool writeLog = true)
        {
            _dapperService.EventSection = $"{gridName} | QueryGridData";

            var output = new GridData();
            try
            {
                con.Open();

                var data = writeLog
                    ? _dapperService.Query(con, queryText, queryParams).ToList()
                    : con.Query(queryText, queryParams).ToList();

                DataTable schema;
                using (var dr = con.ExecuteReader(queryText, queryParams))
                {
                    schema = dr.GetSchemaTable();
                }

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
            }
            catch (Exception ex)
            {
                _eventLogService.AddEventLog(EventLogCategory.EXCEPTION, _dapperService.EventSection, "System Error", ex.StackTrace, null, $"{ex.Message}");
                _logger.LogError(ex, ex.Message);
                throw new DepException("An Error in the query has occurred: " + ex.Message);
            }

            return output;
        }

        public List<DropdownOptionsItem> GetGridColumnFilterOptions(string name, string column)
        {
            _dapperService.EventSection = $"{name} | GetGridColumnFilterOptions";

            var config = GetUniversalGridConfiguration(name);

            var dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);
            var columnsConfig = JsonSerializer.Deserialize<List<GridColConfig>>(config.ColumnsConfig);

            var result = new List<object>();
            var columnConfig = columnsConfig.FirstOrDefault(x => x.field == column);
            if (columnConfig != null && columnConfig.enumFilterValue)
            {
                dataSourceConfig.Columns = new List<string>() { columnConfig.field };
                var query = _queryBuilder.GenerateSqlTextForColumnFilterOption(dataSourceConfig);

                using (var con = _serviceProvider.GetRequiredService<IDbConnection>())
                {
                    con.ConnectionString = config.DataSourceConnection.ConnectionString;

                    try
                    {
                        result = _dapperService.Query(con, query)
                            .Select(x => ((IDictionary<string, object>)x)[columnConfig.field])
                            .Where(x => x != null && x != DBNull.Value)
                            .ToList();
                    }
                    catch (Exception ex)
                    {
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
            var columns = GetGridColumnsConfig(name)
                .Where(x => x.type == "DataBaseField" || x.type == "AttachmentField")
                .ToList();

            var attachmentCols = columns.Where(x => x.type == "AttachmentField");

            var result = GetGridData(name, param);

            #region Process Attachment Columns 

            IDictionary<string, int> attatchmentColCounts = null;
            if (attachmentCols.Any())
            {
                // convert attachment json string to excel hyper link
                attatchmentColCounts = ProcessAttachmentColumns(name, attachmentCols, result);
            }

            #endregion

            var stream = new MemoryStream();
            using (var p = new ExcelPackage(stream))
            {
                var ws = p.Workbook.Worksheets.Add("Data");
                ws.Row(1).Height = 30;

                var columnIndex = 1;
                foreach (var column in columns)
                {
                    if (column.type == "AttachmentField")
                    {
                        var count = attatchmentColCounts[column.field];

                        #region Set Header

                        for (var index = 0; index < count; index++)
                        {
                            ws.Column(columnIndex + index).Width = 20;
                            ws.Column(columnIndex + index).AutoFit(20);
                            SetHeaderStyle(ws.Cells[1, columnIndex + index]);
                        }
                        ws.Cells[1, columnIndex, 1, columnIndex + count - 1].Merge = true;
                        ws.Cells[1, columnIndex].Value = column.header;

                        #endregion

                        #region Set Cell data

                        var rowIndex = 2;
                        foreach (var row in result.Data)
                        {
                            if (row[column.field] != null)
                            {
                                var links = (List<ExcelHyperLink>)row[column.field];
                                for (var index = 0; index < links.Count; index++)
                                {
                                    ws.Cells[rowIndex, columnIndex + index].Hyperlink = links[index];
                                    ws.Cells[rowIndex, columnIndex + index].Style.Font.Color.SetColor(System.Drawing.ColorTranslator.FromHtml("#0A63BC"));
                                    ws.Cells[rowIndex, columnIndex + index].Style.Font.UnderLine = true;
                                }
                            }
                            rowIndex++;
                        }

                        #endregion

                        columnIndex = columnIndex + count;
                    }
                    else
                    {
                        #region Set Header

                        ws.Column(columnIndex).Width = 20;
                        ws.Column(columnIndex).AutoFit(20);
                        ws.Cells[1, columnIndex].Value = column.header;
                        SetHeaderStyle(ws.Cells[1, columnIndex]);

                        #endregion

                        #region Set Cell data

                        var rowIndex = 2;
                        foreach (var row in result.Data)
                        {
                            SetExcelCellValue(ws.Cells[rowIndex, columnIndex], column, row[column.field]);
                            rowIndex++;
                        }

                        #endregion

                        columnIndex++;
                    }
                }

                //var range = ws.Cells[1, 1, result.Data.Count, columnIndex-1];
                //range.AutoFilter = true;

                ws.View.ShowGridLines = true;
                ws.View.FreezePanes(2, 1);

                p.Save();
                p.Dispose();
            }

            stream.Seek(0, SeekOrigin.Begin);
            return stream;
        }

        private void SetHeaderStyle(ExcelRange headerRange)
        {
            headerRange.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
            headerRange.Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            headerRange.Style.Fill.BackgroundColor.SetColor(System.Drawing.ColorTranslator.FromHtml($"#ccc"));
            headerRange.Style.Font.Size = 11;
            headerRange.Style.Font.Bold = true;
            headerRange.Style.WrapText = true;
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

        #region Attachment

        private IDictionary<string, int> ProcessAttachmentColumns(string gridName, IEnumerable<GridColConfig> columns, GridData result)
        {
            var attatchmentColCounts = new Dictionary<string, int>();

            var schema = _httpContextAccessor.HttpContext.Request.Scheme;
            var host = _httpContextAccessor.HttpContext.Request.Host;
            var pathBase = _httpContextAccessor.HttpContext.Request.PathBase;

            var apiUrl = $"{schema}://{host}{pathBase}/api/attachment/download-file/{gridName}";

            foreach (var column in columns)
            {
                var max = 1;
                foreach (var row in result.Data)
                {
                    var value = row[column.field];
                    if (row[column.field] != null)
                    {
                        var links = GetHyperLinks(value, $"{apiUrl}/{column.field}");
                        if (links.Count > max) max = links.Count;

                        row[column.field] = links;
                    }
                }
                attatchmentColCounts.Add(column.field, max);
            }

            return attatchmentColCounts;
        }

        private List<ExcelHyperLink> GetHyperLinks(object value, string apiUrl)
        {
            var files = JsonSerializer.Deserialize<List<UploadedFileModel>>(value.ToString(), new JsonSerializerOptions() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
            var links = files.Where(f => f.Status == UploadedFileStatus.Current)
            .Select(f =>
            {
                var url = $"{apiUrl}/{f.FileId}/{f.FileName}";
                var hyperLink = new ExcelHyperLink(url, UriKind.Absolute);
                hyperLink.Display = f.FileName;
                hyperLink.ToolTip = f.Comments;
                return hyperLink;
            }).ToList();

            return links;
        }

        #endregion 

        #endregion

        #region Grid detail, add, update and remove

        public IDictionary<string, object> GetGridDataDetail(string name, string id)
        {
            _dapperService.EventSection = $"{name} | GetGridDataDetail";

            var config = GetUniversalGridConfiguration(name);

            // get query text for list data from grid config.
            var dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);
            var queryText = _queryBuilder.GenerateSqlTextForDetail(dataSourceConfig);

            // join attachments 
            var attachmentCols = GetAttachmentCols(config);
            if (attachmentCols.Any())
                queryText = _queryBuilder.JoinAttachments(queryText, attachmentCols);

            IDictionary<string, object> details = new Dictionary<string, object>();
            using (var con = _serviceProvider.GetRequiredService<IDbConnection>())
            {
                con.ConnectionString = config.DataSourceConnection.ConnectionString;
                // always provide Id column parameter
                var param = _queryBuilder.GenerateDynamicParameter(new Dictionary<string, object>() { { dataSourceConfig.IdColumn, id } });

                try
                {
                    con.Open();
                    details = (IDictionary<string, object>)_dapperService.QueryFirst(con, queryText, param);

                    DataTable schema;
                    using (var dr = con.ExecuteReader(queryText, param))
                    {
                        schema = dr.GetSchemaTable();
                    }

                    foreach (var key in details.Keys)
                    {
                        var index = details.Keys.ToList().IndexOf(key);
                        details[key] = _queryBuilder.TransformValue(details[key], schema.Rows[index]);
                    }
                }
                catch (Exception ex)
                {
                    _eventLogService.AddEventLog(EventLogCategory.EXCEPTION, _dapperService.EventSection, "System Error", ex.StackTrace, null, $"{ex.Message}");
                    _logger.LogError(ex, ex.Message);
                    throw new DepException("An Error in the query has occurred: " + ex.Message);
                }

                // process value if required
                var result = details.AsList().ToDictionary(x => x.Key, x => x.Value);
                var formLayout = GetUpdatingFormConfig(config);
                var factory = _serviceProvider.GetRequiredService<IValueProcessorFactory>();
                foreach (var field in formLayout.FormFields)
                {
                    var processor = factory.CreateValueProcessor(field, config, con);
                    if (processor != null)
                    {
                        processor.FetchValue(result);
                    }
                }

                return result;
            }
        }

        public bool OnValidateGridData(string name, string type, string id, IDictionary<string, object> model)
        {
            _dapperService.EventSection = $"{name} | ValidateGridData";

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

            using (var con = _serviceProvider.GetRequiredService<IDbConnection>())
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
                foreach (var field in formLayout.FormFields)
                {
                    var processor = factory.CreateValueProcessor(field, config, con);
                    if (processor != null)
                    {
                        processor.PreProcess(model);
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
                    var data = _dapperService.ExecuteScalar(con, queryText, param, null, null, commandType);
                    if (data != DBNull.Value && data != null)
                    {
                        var temp = 0;
                        int.TryParse(data.ToString(), out temp);
                        result = temp == 1;
                    }
                }
                catch (Exception ex)
                {
                    _eventLogService.AddEventLog(EventLogCategory.EXCEPTION, _dapperService.EventSection, "System Error", ex.StackTrace, null, $"{ex.Message}");
                    _logger.LogError(ex, ex.Message);
                    throw new DepException("An Error in the query has occurred: " + ex.Message);
                }
            }

            return result;
        }

        public bool AddGridData(string name, IDictionary<string, object> model)
        {
            _dapperService.EventSection = $"{name} | AddGridData";

            var config = GetUniversalGridConfiguration(name);

            // get query text for list data from grid config.
            var dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);

            // get detail config
            var formLayout = GetAddingFormConfig(config);
            using (var con = _serviceProvider.GetRequiredService<IDbConnection>())
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

                // excute command
                var trans = _dapperService.BeginTransaction(con);

                // use value processor to convert values in model
                var factory = _serviceProvider.GetRequiredService<IValueProcessorFactory>();
                var valueProcessors = new List<ValueProcessorBase>();
                foreach (var field in formLayout.FormFields)
                {
                    var processor = factory.CreateValueProcessor(field, config, con, trans);
                    if (processor != null)
                    {
                        valueProcessors.Add(processor);
                        processor.PreProcess(model);
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

                try
                {
                    var dynamicParameters = new DynamicParameters(param);
                    var paramReturnId = _queryBuilder.ParameterName($"RETURNED_{dataSourceConfig.IdColumn}");
                    dynamicParameters.Add(paramReturnId, dbType: null, direction: ParameterDirection.Output, size: 40);

                    var affected = _dapperService.Execute(con, queryText, dynamicParameters, trans);
                    var returnedId = dynamicParameters.Get<object>(paramReturnId);

                    if (model.Keys.Contains(dataSourceConfig.IdColumn))
                        model[dataSourceConfig.IdColumn] = returnedId;
                    else model.Add(dataSourceConfig.IdColumn, returnedId);

                    // use value processors to execute extra operations
                    foreach (var processor in valueProcessors)
                    {
                        processor.PostProcess(model);
                    }

                    _dapperService.Commit(trans);

                    // run after saved event handler
                    if (formLayout?.AfterSaved != null)
                    {
                        AfterSaved(formLayout.AfterSaved, config.Name, config.DataSourceConnection.ConnectionString, model);
                    }
                }
                catch (Exception ex)
                {
                    _dapperService.Rollback(trans);

                    _eventLogService.AddEventLog(EventLogCategory.EXCEPTION, _dapperService.EventSection, "System Error", ex.StackTrace, null, $"{ex.Message}");
                    _logger.LogError(ex, ex.Message);
                    throw new DepException("An Error in the query has occurred: " + ex.Message);
                }
            }

            return true;
        }

        public bool UpdateGridData(string name, string id, IDictionary<string, object> model)
        {
            _dapperService.EventSection = $"{name} | UpdateGridData";

            var config = GetUniversalGridConfiguration(name);

            // get query text for list data from grid config.
            var dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);

            // get detail config
            var formLayout = GetUpdatingFormConfig(config);

            using (var con = _serviceProvider.GetRequiredService<IDbConnection>())
            {
                con.ConnectionString = config.DataSourceConnection.ConnectionString;
                con.Open();

                #region prepair values and paramsters
                // drop the keyvalue which not in formfield defination
                model = model.ToList()
                    .Where(kv => formLayout.FormFields.Any(f => kv.Key == f.key))
                    .ToDictionary(x => x.Key, x => x.Value);

                // add id parameter
                if (model.ContainsKey(dataSourceConfig.IdColumn))
                    model[dataSourceConfig.IdColumn] = id;
                else
                    model.Add(dataSourceConfig.IdColumn, id);

                // calculate the computed field values
                ProcessComputedValues(formLayout.FormFields, model, con);

                // excute command
                var trans = _dapperService.BeginTransaction(con);

                // use value processor to convert values in model
                var factory = _serviceProvider.GetRequiredService<IValueProcessorFactory>();
                var valueProcessors = new List<ValueProcessorBase>();
                foreach (var field in formLayout.FormFields)
                {
                    var processor = factory.CreateValueProcessor(field, config, con, trans);
                    if (processor != null)
                    {
                        valueProcessors.Add(processor);
                        processor.PreProcess(model);
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
                var param = _queryBuilder.GenerateDynamicParameter(model.AsEnumerable());

                #endregion

                try
                {
                    var affected = _dapperService.Execute(con, queryText, param, trans);

                    // use value processors to execute extra operations
                    foreach (var processor in valueProcessors)
                    {
                        processor.PostProcess(model);
                    }

                    _dapperService.Commit(trans);

                    // run after saved event
                    if (formLayout?.AfterSaved != null)
                    {
                        AfterSaved(formLayout.AfterSaved, config.Name, config.DataSourceConnection.ConnectionString, model);
                    }
                }
                catch (Exception ex)
                {
                    _dapperService.Rollback(trans);

                    _eventLogService.AddEventLog(EventLogCategory.EXCEPTION, _dapperService.EventSection, "System Error", ex.StackTrace, null, $"{ex.Message}");
                    _logger.LogError(ex, ex.Message);
                    throw new DepException("An Error in the query has occurred: " + ex.Message);
                }
            }

            return true;
        }

        public bool DeleteGridData(string name, object[] ids)
        {
            _dapperService.EventSection = $"{name} | DeleteGridData";

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
            if (detailConfig.AddingForm != null && detailConfig.AddingForm.FormFields != null)
                detailConfig.AddingForm.FormFields.ForEach(x => { if (!fields.Any(f => x.key == f.key)) fields.Add(x); });
            if (detailConfig.UpdatingForm != null && detailConfig.UpdatingForm.FormFields != null)
                detailConfig.UpdatingForm.FormFields.ForEach(x => { if (!fields.Any(f => x.key == f.key)) fields.Add(x); });

            using (var con = _serviceProvider.GetRequiredService<IDbConnection>())
            {
                con.ConnectionString = config.DataSourceConnection.ConnectionString;
                con.Open();
                var trans = _dapperService.BeginTransaction(con);

                try
                {
                    // use value processor to convert values in model
                    var factory = _serviceProvider.GetRequiredService<IValueProcessorFactory>();
                    var valueProcessors = new List<ValueProcessorBase>();
                    foreach (var field in fields)
                    {
                        var processor = factory.CreateValueProcessor(field, config, con, trans);
                        if (processor != null)
                        {
                            processor.BeforeDeleted(ids);
                            valueProcessors.Add(processor);
                        }
                    }

                    var affected = _dapperService.Execute(con, queryText, param, trans);

                    // use value processors to execute extra operations
                    foreach (var processor in valueProcessors)
                    {
                        processor.AfterDeleted();
                    }

                    _dapperService.Commit(trans);

                    // run after saved event
                    if (detailConfig.DeletingForm?.AfterSaved != null)
                    {
                        AfterSaved(detailConfig.DeletingForm?.AfterSaved, config.Name, config.DataSourceConnection.ConnectionString, new Dictionary<string, object>() { { dataSourceConfig.IdColumn, ids } });
                    }
                }
                catch (Exception ex)
                {
                    _dapperService.Rollback(trans);

                    _eventLogService.AddEventLog(EventLogCategory.EXCEPTION, _dapperService.EventSection, "System Error", ex.StackTrace, null, $"{ex.Message}");
                    _logger.LogError(ex, ex.Message);
                    throw new DepException("An Error in the query has occurred: " + ex.Message);
                }
            }

            return true;
        }

        private void ProcessComputedValues(List<FormFieldConfig> formFields, IDictionary<string, object> model, IDbConnection con)
        {
            var currentUser = _depDbContext.Users.FirstOrDefault(x => x.Username == _currentUsername);

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
                                var value = _dapperService.ExecuteScalar(con, query.Item1, query.Item2, null, null, field.computedConfig.type);
                                SetModelValue(model, field.key, value);
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex, ex.Message);
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

        private void AfterSaved(FormEventConfig eventConfig, string name, string connectionString, IDictionary<string, object> model)
        {
            _dapperService.EventSection = $"{name} | AfterSaved";

            if (eventConfig == null || string.IsNullOrEmpty(eventConfig.Script)) return;

            try
            {
                if (eventConfig.EventType == FormEventType.QueryText || eventConfig.EventType == FormEventType.QueryStoredProcedure)
                {
                    var commandType = eventConfig.EventType == FormEventType.QueryText ? CommandType.Text : CommandType.StoredProcedure;
                    var queryText = _queryBuilder.ReplaceQueryParamters(eventConfig.Script);
                    var param = _queryBuilder.GenerateDynamicParameter(model.AsEnumerable());

                    using (var con = _serviceProvider.GetRequiredService<IDbConnection>())
                    {
                        con.ConnectionString = connectionString;

                        _dapperService.Execute(con, queryText, param, null, null, commandType);
                    }
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
                    _eventLogService.AddEventLog(EventLogCategory.INFO, _dapperService.EventSection, "Execute Command Line", eventConfig.Script);
                }
            }
            catch (Exception ex)
            {
                _eventLogService.AddEventLog(EventLogCategory.EXCEPTION, _dapperService.EventSection, "System Error", ex.StackTrace, JsonSerializer.Serialize(eventConfig), ex.Message);
                _logger.LogError(ex, ex.Message);
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
                return columnsConfig.Where(x => x.type == "AttachmentField").Select(x =>
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

        public GridData GetGridDataForFieldControl(string table1Name, GridParam gridParam)
        {
            var relationInfo = GetRelationInfo(table1Name);
            gridParam.IndexCount = 0;
            return GetGridData(relationInfo.Table2.Name, gridParam);
        }
        public dynamic GetRelationConfigForFieldControl(string table1Name)
        {
            var relationInfo = GetRelationInfo(table1Name);
            var columns = GetGridColumnsConfig(relationInfo.Table2.Name);

            return new
            {
                columns = columns.Where(c => relationInfo.Table2.EditorColumns.Contains(c.field)).ToList(),
                table2Name = relationInfo.Table2.Name,
                table2IdColumn = relationInfo.Table2.IdColumn,
                table1IsPrimary = relationInfo.Table1IsPrimary,
                isOneToMany = relationInfo.IsOneToMany
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
            _dapperService.EventSection = $"{table1Name} | GetLinkedDataIdsForList";

            var relationInfo = GetRelationInfo(table1Name);

            var queryText = relationInfo.Table2.Query_GetRelationDataById;
            var param = _queryBuilder.GenerateDynamicParameter(new Dictionary<string, object>() { { relationInfo.Table2.IdColumn, table2Id } });

            var table1Ids = Enumerable.Empty<object>();
            try
            {
                using (var con = _serviceProvider.GetRequiredService<IDbConnection>())
                {
                    con.ConnectionString = relationInfo.ConnectionString;
                    con.Open();
                    var datas = _dapperService.Query(con, queryText, param);

                    table1Ids = datas.Select(data =>
                    {
                        var item = (IDictionary<string, object>)data;
                        return item[$"T2_{relationInfo.Table1.IdColumn}"];
                    });
                }
            }
            catch (Exception ex)
            {
                _eventLogService.AddEventLog(EventLogCategory.EXCEPTION, _dapperService.EventSection, "System Error", ex.StackTrace, null, $"{ex.Message}");
                _logger.LogError(ex, ex.Message);
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
                SecondaryTableName = secondary != null ? secondary.Name : null,
                UseAsMasterDetailView = dataSourceConfig.UseAsMasterDetailView
            };
        }

        public RelationInfo GetRelationInfo(string table1Name)
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
                var relationInfo = dsLink.LinkTable;

                var primary = tables.Where(x => x.ItemType == GridItemType.LINKED_SINGLE)
                    .OrderBy(t => t.Order)
                    .Select(t =>
                    {
                        var ds = JsonSerializer.Deserialize<DataSourceConfig>(t.DataSource);
                        return new TableMeta()
                        {
                            Name = t.Name,
                            MenuId = t.Id,
                            TableSchema = ds.TableSchema,
                            TableName = ds.TableName,
                            IdColumn = ds.IdColumn,
                            Query_AllData = _queryBuilder.GenerateSqlTextForDatasource(ds),
                            EditorColumns = dsLink.PrimaryTable.ColumnsForLinkedField,
                            ReferenceKey = relationInfo.PrimaryReferenceKey,
                            ForeignKey = relationInfo.PrimaryForeignKey,
                            ConnectionString = t.ConnectionString
                        };
                    })
                    .FirstOrDefault();

                var secondary = tables.Where(x => x.ItemType == GridItemType.LINKED_SINGLE)
                    .OrderByDescending(t => t.Order)
                    .Select(t =>
                    {
                        var ds = JsonSerializer.Deserialize<DataSourceConfig>(t.DataSource);
                        return new TableMeta()
                        {
                            Name = t.Name,
                            MenuId = t.Id,
                            TableSchema = ds.TableSchema,
                            TableName = ds.TableName,
                            IdColumn = ds.IdColumn,
                            Query_AllData = _queryBuilder.GenerateSqlTextForDatasource(ds),
                            EditorColumns = dsLink.SecondaryTable.ColumnsForLinkedField,
                            ReferenceKey = relationInfo.SecondaryReferenceKey,
                            ForeignKey = relationInfo.SecondaryForeignKey,
                            ConnectionString = t.ConnectionString
                        };
                    })
                    .FirstOrDefault();

                // compose relation info result
                var table1IsPrimary = primary.Name == table1Name;

                #region query relations by table 1 id.

                if (relationInfo.IsOneToMany)
                {
                    primary.Query_GetRelationDataById = _queryBuilder.GenerateSqlTextForGetRelation(primary, secondary);
                    secondary.Query_GetRelationDataById = _queryBuilder.GenerateSqlTextForGetRelation(secondary, primary);
                }
                else
                {
                    var relationTableDs = new DataSourceConfig()
                    {
                        Columns = new List<string>() { relationInfo.IdColumn, relationInfo.PrimaryForeignKey, relationInfo.SecondaryForeignKey },
                        TableName = relationInfo.TableName,
                        TableSchema = relationInfo.TableSchema,
                        IdColumn = relationInfo.IdColumn
                    };
                    primary.Query_GetRelationDataById = _queryBuilder.GenerateSqlTextForGetRelation(primary, secondary, relationTableDs);
                    secondary.Query_GetRelationDataById = _queryBuilder.GenerateSqlTextForGetRelation(secondary, primary, relationTableDs);
                }

                #endregion

                #region query_AddRelation
                var query_AddRelation = string.Empty;
                if (relationInfo.IsOneToMany)
                {
                    // Generate update sql to table2
                    query_AddRelation = _queryBuilder.GenerateSqlTextForAddRelation(
                        new DataSourceConfig()
                        {
                            Columns = new List<string>() { primary.ForeignKey },
                            TableName = secondary.TableName,
                            TableSchema = secondary.TableSchema,
                            IdColumn = secondary.IdColumn,
                        }, true);
                }
                else
                {
                    // Genearte insert sql to link table
                    query_AddRelation = _queryBuilder.GenerateSqlTextForAddRelation(
                        new DataSourceConfig()
                        {
                            Columns = new List<string>() { relationInfo.PrimaryForeignKey, relationInfo.SecondaryForeignKey },
                            TableName = relationInfo.TableName,
                            TableSchema = relationInfo.TableSchema,
                            IdColumn = relationInfo.IdColumn,
                            QueryText = relationInfo.QueryInsert
                        }, false);
                }
                #endregion

                #region query_RemoveRelation
                var query_RemoveRelation = string.Empty;
                if (relationInfo.IsOneToMany)
                {
                    // Generate update sql to table2
                    query_RemoveRelation = _queryBuilder.GenerateSqlTextForRemoveRelation(
                        new DataSourceConfig()
                        {
                            Columns = new List<string>() { primary.ForeignKey },
                            TableName = secondary.TableName,
                            TableSchema = secondary.TableSchema,
                            IdColumn = secondary.IdColumn,
                        }, true);
                }
                else
                {
                    // Genearte delete sql to link table
                    query_RemoveRelation = _queryBuilder.GenerateSqlTextForRemoveRelation(
                        new DataSourceConfig()
                        {
                            TableName = relationInfo.TableName,
                            TableSchema = relationInfo.TableSchema,
                            IdColumn = relationInfo.IdColumn,
                            Filters = new List<FilterParam>() {
                                new FilterParam() { field = primary.ForeignKey },
                                new FilterParam() { field = secondary.ForeignKey }
                            }
                        }, false);
                }
                #endregion

                #region query to batch remove relation

                var query_RemoveRelationByTable1Id = string.Empty;
                if (relationInfo.IsOneToMany)
                {
                    primary.Query_RemoveRelationById = _queryBuilder.GenerateSqlTextForBatchRemoveRelation(primary, secondary);
                    secondary.Query_RemoveRelationById = string.Empty; // do not need to remove any relation in one to many mode for secondary table.
                }
                else
                {
                    primary.Query_RemoveRelationById = _queryBuilder.GenerateSqlTextForBatchRemoveRelation(primary, secondary, dsLink.LinkTable);
                    secondary.Query_RemoveRelationById = _queryBuilder.GenerateSqlTextForBatchRemoveRelation(secondary, primary, dsLink.LinkTable);
                }

                #endregion

                return new RelationInfo()
                {
                    Table1 = table1IsPrimary ? primary : secondary,
                    Table2 = table1IsPrimary ? secondary : primary,
                    Query_AddRelation = query_AddRelation,
                    Query_RemoveRelation = query_RemoveRelation,
                    ConnectionString = primary.ConnectionString,
                    IsOneToMany = relationInfo.IsOneToMany,
                    Table1IsPrimary = table1IsPrimary
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
            _dapperService.EventSection = $"{name} | CheckDataExists";

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
            using (var con = _serviceProvider.GetRequiredService<IDbConnection>())
            {
                con.ConnectionString = config.DataSourceConnection.ConnectionString;
                con.Open();

                try
                {
                    var data = _dapperService.Query(con, queryText, param);

                    DataTable schema;
                    using (var dr = con.ExecuteReader(queryText, param))
                    {
                        schema = dr.GetSchemaTable();
                    }
                    result = data.Select(x =>
                    {
                        var row = (IDictionary<string, object>)x;
                        return _queryBuilder.TransformValue(row[dataSourceConfig.IdColumn], schema.Rows[0]);
                    });
                }
                catch (Exception ex)
                {
                    _eventLogService.AddEventLog(EventLogCategory.EXCEPTION, _dapperService.EventSection, "System Error", ex.StackTrace, null, $"{ex.Message}");
                    _logger.LogError(ex, ex.Message);
                }
            }

            return result;
        }
    }

}