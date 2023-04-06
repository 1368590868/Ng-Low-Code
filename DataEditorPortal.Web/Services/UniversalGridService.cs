using AutoMapper;
using Dapper;
using DataEditorPortal.Data.Common;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.ExcelExport;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Models;
using DataEditorPortal.Web.Models.UniversalGrid;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
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
        GridData GetLinkedTableDataForFieldControl(string table1Name, Dictionary<string, object> searches);
        List<GridColConfig> GetLinkedTableColumnForFieldControl(string tableName);
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

        public UniversalGridService(
            IServiceProvider serviceProvider,
            DepDbContext depDbContext,
            IQueryBuilder queryBuilder,
            ILogger<UniversalGridService> logger,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor,
            IEventLogService eventLogService)
        {
            _serviceProvider = serviceProvider;
            _depDbContext = depDbContext;
            _queryBuilder = queryBuilder;
            _logger = logger;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _eventLogService = eventLogService;
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
            var config = _depDbContext.UniversalGridConfigurations.Include(x => x.DataSourceConnection).FirstOrDefault(x => x.Name == name);
            if (config == null) throw new DepException("Grid configuration does not exists with name: " + name);

            #region compose the query text

            // get query text for list data from grid config.
            var dataSourceConfig = new DataSourceConfig();
            if (config.ItemType == GridItemType.LINKED)
            {
                var linkedDataSourceConfig = JsonSerializer.Deserialize<LinkedDataSourceConfig>(config.DataSourceConfig);
                dataSourceConfig = linkedDataSourceConfig.LinkedTable;
            }
            else
            {
                dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);
            }

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
            var config = _depDbContext.UniversalGridConfigurations.Include(x => x.DataSourceConnection).FirstOrDefault(x => x.Name == name);
            if (config == null) throw new DepException("Grid configuration does not exists with name: " + name);

            // get query text for list data from grid config.
            var dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);
            var queryText = _queryBuilder.GenerateSqlTextForDetail(dataSourceConfig);

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

                // calculate the computed field values
                AssignComputedValues(formLayout.FormFields, model, con);

                // generate the query text
                var queryText = _queryBuilder.ReplaceQueryParamters(formLayout.OnValidate.Script);

                // add query parameters
                if (model.ContainsKey(dataSourceConfig.IdColumn))
                    model[dataSourceConfig.IdColumn] = id;
                else
                    model.Add(dataSourceConfig.IdColumn, id);
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
                var trans = con.BeginTransaction();

                #region prepair values and params

                // process file upload, store json string
                var uploadedFieldsMeta = ProcessFileUploadFileds(formLayout.FormFields, model);

                LinkDataModel linkDataMeta = null;
                if (config.ItemType == GridItemType.LINKED_SINGLE)
                {
                    // process link data field, get meta data and clear value in model
                    linkDataMeta = ProcessLinkDataField(model);
                }

                // calculate the computed field values
                AssignComputedValues(formLayout.FormFields, model, con);

                // filter the columns that have values
                var columns = formLayout.FormFields
                    .Select(x => x.key)
                    .Where(x => model.Keys.Contains(x) && model[x] != null)
                    .ToList();

                // generate the query text
                var queryText = _queryBuilder.GenerateSqlTextForInsert(new DataSourceConfig()
                {
                    IdColumn = dataSourceConfig.IdColumn,
                    TableSchema = dataSourceConfig.TableSchema,
                    TableName = dataSourceConfig.TableName,
                    Columns = columns,
                    QueryText = formLayout.QueryText
                });

                // add query parameters
                var param = _queryBuilder.GenerateDynamicParameter(model.AsEnumerable());

                #endregion

                // excute command
                try
                {
                    var dynamicParameters = new DynamicParameters(param);
                    dynamicParameters.Add("RETURNED_ID", dbType: DbType.String, direction: ParameterDirection.Output, size: 40);

                    var affected = con.Execute(queryText, dynamicParameters, trans);
                    var returnedId = dynamicParameters.Get<string>("RETURNED_ID");

                    // process file upload
                    SaveUploadedFiles(config.Name, uploadedFieldsMeta);

                    if (linkDataMeta != null)
                    {
                        // update linked data
                        UpdateLinkData(config.Name, linkDataMeta, returnedId);
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
                var trans = con.BeginTransaction();

                #region prepair values and paramsters

                // process file upload, store json string
                var uploadedFieldsMeta = ProcessFileUploadFileds(formLayout.FormFields, model);

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
                try
                {
                    var affected = con.Execute(queryText, param, trans);

                    // process file upload
                    SaveUploadedFiles(config.Name, uploadedFieldsMeta);

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
                            var queryText = field.computedConfig.queryText;
                            try
                            {
                                var value = con.ExecuteScalar(queryText, null, null, null, field.computedConfig.type);
                                SetModelValue(model, field.key, value);
                                _eventLogService.AddDbQueryLog(EventLogCategory.DB_SUCCESS, "Get Computed Value", queryText);
                            }
                            catch (Exception ex)
                            {
                                _eventLogService.AddDbQueryLog(EventLogCategory.DB_ERROR, "Get Computed Value", queryText, null, ex.Message);
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

        private IFileStorageService GetFileStorageService(FileStorageType type)
        {
            switch (type)
            {
                case FileStorageType.FileSystem:
                    return _serviceProvider.GetRequiredService<PhsicalFileStorageService>();
                case FileStorageType.SqlBinary:
                    return _serviceProvider.GetRequiredService<BinaryFileStorageService>();
                default:
                    return _serviceProvider.GetRequiredService<PhsicalFileStorageService>();
            }
        }

        private Dictionary<string, List<UploadedFileModel>> ProcessFileUploadFileds(List<FormFieldConfig> formFields, Dictionary<string, object> model)
        {
            var result = new Dictionary<string, List<UploadedFileModel>>();
            var fileUploadFields = formFields.Where(x => x.type == "fileUpload").ToList();
            foreach (var field in fileUploadFields)
            {
                if (model.ContainsKey(field.key))
                {
                    var jsonOptions = new JsonSerializerOptions() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
                    var jsonElement = (JsonElement)model[field.key];
                    if (jsonElement.ValueKind == JsonValueKind.Array || jsonElement.ValueKind == JsonValueKind.String)
                    {
                        var valueStr = jsonElement.ToString();
                        model[field.key] = valueStr.Replace("\"status\":\"New\"", "\"status\":\"Current\"");

                        var storageType = ((JsonElement)field.props).GetProperty("storageType").ToString();
                        result.Add(storageType, JsonSerializer.Deserialize<List<UploadedFileModel>>(valueStr, jsonOptions));
                    }
                    else
                        model[field.key] = "[]";
                }
            }
            return result;
        }

        private void SaveUploadedFiles(string gridName, Dictionary<string, List<UploadedFileModel>> uploadedFiledsMeta)
        {
            foreach (var meta in uploadedFiledsMeta)
            {
                var storageType = meta.Key;
                FileStorageType storageTypeEnum = FileStorageType.FileSystem;
                Enum.TryParse(storageType, out storageTypeEnum);
                var fileStorageService = GetFileStorageService(storageTypeEnum);
                fileStorageService.SaveFiles(meta.Value, gridName);
            }
        }

        #endregion

        #region Linked Data API

        public GridData GetLinkedTableDataForFieldControl(string table1Name, Dictionary<string, object> searches)
        {
            // get parentId
            var parentIdQuery = from u in _depDbContext.UniversalGridConfigurations
                                join m in _depDbContext.SiteMenus on u.Name equals m.Name
                                where u.ItemType == GridItemType.LINKED_SINGLE && u.Name == table1Name
                                select m.ParentId;

            // get table2 config
            var table2Config = (from u in _depDbContext.UniversalGridConfigurations
                                join m in _depDbContext.SiteMenus on u.Name equals m.Name
                                join parentId in parentIdQuery on m.ParentId equals parentId
                                where u.ItemType == GridItemType.LINKED_SINGLE && u.Name != table1Name
                                select u).FirstOrDefault();

            // get table2 data by current search
            var dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(table2Config.DataSourceConfig);
            var table2Data = GetGridData(table2Config.Name, new GridParam() { IndexCount = 50, StartIndex = 0, Searches = searches });

            return table2Data;
        }
        public List<GridColConfig> GetLinkedTableColumnForFieldControl(string tableName)
        {
            // get table Menu
            var tableMenu = (from u in _depDbContext.UniversalGridConfigurations
                             join m in _depDbContext.SiteMenus on u.Name equals m.Name
                             where u.ItemType == GridItemType.LINKED_SINGLE && u.Name == tableName
                             select m).FirstOrDefault();

            // get main configration
            var mainConfiguration = (from u in _depDbContext.UniversalGridConfigurations
                                     join m in _depDbContext.SiteMenus on u.Name equals m.Name
                                     where m.Id == tableMenu.ParentId
                                     select u).FirstOrDefault();

            // get saved table2 id from linked table
            var linkedDataSourceConfig = JsonSerializer.Deserialize<LinkedDataSourceConfig>(mainConfiguration.DataSourceConfig);
            var columnsForLinkedField = linkedDataSourceConfig.PrimaryTable.Id == tableMenu.Id ? linkedDataSourceConfig.PrimaryTable.ColumnsForLinkedField : linkedDataSourceConfig.SecondaryTable.ColumnsForLinkedField;
            var columns = GetGridColumnsConfig(tableMenu.Name);

            return columns.Where(c => columnsForLinkedField.Contains(c.field)).ToList();
        }

        public IEnumerable<object> GetLinkedDataIdsForList(string table1Name, string table2Id)
        {
            // get table1 Menu
            var table1Menu = (from u in _depDbContext.UniversalGridConfigurations
                              join m in _depDbContext.SiteMenus on u.Name equals m.Name
                              where u.ItemType == GridItemType.LINKED_SINGLE && u.Name == table1Name
                              select m).FirstOrDefault();

            // get main configration
            var mainConfiguration = (from u in _depDbContext.UniversalGridConfigurations
                                     join m in _depDbContext.SiteMenus on u.Name equals m.Name
                                     where m.Id == table1Menu.ParentId
                                     select u).FirstOrDefault();

            // get saved table2 id from linked table
            var linkedDataSourceConfig = JsonSerializer.Deserialize<LinkedDataSourceConfig>(mainConfiguration.DataSourceConfig);
            var filters = new List<FilterParam>() {
                new FilterParam() {
                    field =  linkedDataSourceConfig.PrimaryTable.Id == table1Menu.Id
                        ? linkedDataSourceConfig.SecondaryTable.MapToLinkedTableField
                        : linkedDataSourceConfig.PrimaryTable.MapToLinkedTableField,
                    value = table2Id,
                    matchMode = "equals"
                }
            };
            var table1IdFieldName = linkedDataSourceConfig.PrimaryTable.Id == table1Menu.Id
                ? linkedDataSourceConfig.PrimaryTable.MapToLinkedTableField
                : linkedDataSourceConfig.SecondaryTable.MapToLinkedTableField;
            var linkedData = GetGridData(mainConfiguration.Name, new GridParam() { IndexCount = -1, Filters = filters });
            var savedTable1Ids = linkedData.Data.Select(x => x[table1IdFieldName]);

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

        private LinkDataModel GetLinkDataModelForForm(string table1Name, string table1Id)
        {
            // get table1 Menu
            var table1Menu = (from u in _depDbContext.UniversalGridConfigurations
                              join m in _depDbContext.SiteMenus on u.Name equals m.Name
                              where u.ItemType == GridItemType.LINKED_SINGLE && u.Name == table1Name
                              select m).FirstOrDefault();

            // get main configration
            var mainConfiguration = (from u in _depDbContext.UniversalGridConfigurations
                                     join m in _depDbContext.SiteMenus on u.Name equals m.Name
                                     where m.Id == table1Menu.ParentId
                                     select u).FirstOrDefault();

            // get saved table2 id from linked table
            List<RelationDataModel> relationData = new List<RelationDataModel>();
            if (!string.IsNullOrEmpty(table1Id))
            {
                var linkedDataSourceConfig = JsonSerializer.Deserialize<LinkedDataSourceConfig>(mainConfiguration.DataSourceConfig);
                var filters = new List<FilterParam>() {
                    new FilterParam() {
                        field =  linkedDataSourceConfig.PrimaryTable.Id == table1Menu.Id
                            ? linkedDataSourceConfig.PrimaryTable.MapToLinkedTableField
                            : linkedDataSourceConfig.SecondaryTable.MapToLinkedTableField,
                        value = table1Id,
                        matchMode = "equals"
                    }
                };
                var table2IdFieldName = linkedDataSourceConfig.PrimaryTable.Id == table1Menu.Id
                    ? linkedDataSourceConfig.SecondaryTable.MapToLinkedTableField
                    : linkedDataSourceConfig.PrimaryTable.MapToLinkedTableField;
                var linkedData = GetGridData(mainConfiguration.Name, new GridParam() { IndexCount = -1, Filters = filters });
                relationData = linkedData.Data.Select(x => new RelationDataModel()
                {
                    Id = x[linkedDataSourceConfig.LinkedTable.IdColumn].ToString(),
                    Table1Id = table1Id,
                    Table2Id = x[table2IdFieldName].ToString()
                }).ToList();
            }

            return new LinkDataModel()
            {
                RelationData = relationData
            };
        }
        private LinkDataModel ProcessLinkDataField(Dictionary<string, object> model)
        {
            LinkDataModel result = null;
            if (model.ContainsKey(Constants.LINK_DATA_FIELD_NAME) && model[Constants.LINK_DATA_FIELD_NAME] != null)
            {
                var jsonOptions = new JsonSerializerOptions() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
                var jsonElement = (JsonElement)model[Constants.LINK_DATA_FIELD_NAME];
                if (jsonElement.ValueKind == JsonValueKind.Object || jsonElement.ValueKind == JsonValueKind.String)
                {
                    var valueStr = jsonElement.ToString();
                    result = JsonSerializer.Deserialize<LinkDataModel>(valueStr, jsonOptions);
                    model[Constants.LINK_DATA_FIELD_NAME] = null;
                }
            }
            return result;
        }
        private void UpdateLinkData(string table1PortalItemName, LinkDataModel model, object table1Id)
        {
            if (!model.IdsOfTable2ForAdd.Any() && !model.IdsOfRelationTableForRemove.Any()) return;

            // get main configration
            var query = (
                from u in _depDbContext.UniversalGridConfigurations.Include(x => x.DataSourceConnection)
                join mp in _depDbContext.SiteMenus on u.Name equals mp.Name
                join mc in _depDbContext.SiteMenus on mp.Id equals mc.ParentId
                where mc.Name == table1PortalItemName
                select new { u, mc.Id }
            ).FirstOrDefault();

            var mainConfiguration = query.u;
            var table1PortalItemId = query.Id;

            var linkedDataSourceConfig = JsonSerializer.Deserialize<LinkedDataSourceConfig>(mainConfiguration.DataSourceConfig);

            var table1Field = linkedDataSourceConfig.PrimaryTable.Id == table1PortalItemId
                ? linkedDataSourceConfig.PrimaryTable.MapToLinkedTableField
                : linkedDataSourceConfig.SecondaryTable.MapToLinkedTableField;
            var table2Field = linkedDataSourceConfig.PrimaryTable.Id == table1PortalItemId
                ? linkedDataSourceConfig.SecondaryTable.MapToLinkedTableField
                : linkedDataSourceConfig.PrimaryTable.MapToLinkedTableField;

            var columns = new List<string>() { table1Field, table2Field };

            using (var con = _serviceProvider.GetRequiredService<DbConnection>())
            {
                con.ConnectionString = mainConfiguration.DataSourceConnection.ConnectionString;
                //var trans = con.BeginTransaction();

                try
                {
                    if (model.IdsOfTable2ForAdd.Any())
                    {
                        linkedDataSourceConfig.LinkedTable.Columns = columns;
                        var sql = _queryBuilder.GenerateSqlTextForInsert(linkedDataSourceConfig.LinkedTable);

                        var param = new List<object>();
                        foreach (var table2Id in model.IdsOfTable2ForAdd)
                        {
                            var value = new List<KeyValuePair<string, object>>();
                            value.Add(new KeyValuePair<string, object>(table1Field, table1Id));
                            value.Add(new KeyValuePair<string, object>(table2Field, table2Id));
                            var dynamicParameters = new DynamicParameters(_queryBuilder.GenerateDynamicParameter(value));
                            dynamicParameters.Add("RETURNED_ID", dbType: DbType.String, direction: ParameterDirection.Output, size: 40);

                            param.Add(dynamicParameters);
                        }

                        con.Execute(sql, param);
                    }

                    if (model.IdsOfRelationTableForRemove.Any())
                    {
                        var deleteSql = _queryBuilder.GenerateSqlTextForDelete(linkedDataSourceConfig.LinkedTable);
                        var deleteParam = _queryBuilder.GenerateDynamicParameter(
                            new List<KeyValuePair<string, object>>() {
                        new KeyValuePair<string, object>(linkedDataSourceConfig.LinkedTable.IdColumn, model.IdsOfRelationTableForRemove)
                            });
                        con.Execute(deleteSql, deleteParam);
                    }
                    //trans.Commit();
                }
                catch (Exception ex)
                {
                    //trans.Rollback();
                    _logger.LogError(ex.Message, ex);
                    throw ex;
                }
            }
        }

        #endregion

    }
}