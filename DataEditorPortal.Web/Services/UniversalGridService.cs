using AutoMapper;
using Dapper;
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
using System.Dynamic;
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
        List<FormFieldConfig> GetGridDetailConfig(string name, string type);

        GridData GetGridData(string name, GridParam param);
        GridData QueryGridData(DbConnection con, string queryText, string gridName, bool writeLog = false);
        MemoryStream ExportExcel(string name, ExportParam param);

        IDictionary<string, object> GetGridDataDetail(string name, string id);
        bool UpdateGridData(string name, string id, Dictionary<string, object> model);
        bool AddGridData(string name, Dictionary<string, object> model);
        bool DeleteGridData(string name, string[] ids);
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

        #region Grid cofnig, columns config, search config and list data

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

        public GridData GetGridData(string name, GridParam param)
        {
            var config = _depDbContext.UniversalGridConfigurations.Include(x => x.DataSourceConnection).FirstOrDefault(x => x.Name == name);
            if (config == null) throw new DepException("Grid configuration does not exists with name: " + name);

            #region compose the query text

            // get query text for list data from grid config.
            var dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);
            var queryText = _queryBuilder.GenerateSqlTextForList(dataSourceConfig);

            // convert search criteria to where clause
            var searchConfig = JsonSerializer.Deserialize<List<SearchFieldConfig>>(config.SearchConfig);
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
                    .ToList();
            }
            queryText = _queryBuilder.UseSearches(queryText, searchRules);

            // convert grid filter to where clause
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

            // run sql query text
            var output = new GridData();
            using (var con = _serviceProvider.GetRequiredService<DbConnection>())
            {
                con.ConnectionString = config.DataSourceConnection.ConnectionString;

                output = QueryGridData(con, queryText, name);
            }

            return output;
        }

        public GridData QueryGridData(DbConnection con, string queryText, string gridName, bool writeLog = true)
        {
            var output = new GridData();
            try
            {
                con.Open();

                DataTable schema;
                using (var dr = con.ExecuteReader(queryText))
                {
                    schema = dr.GetSchemaTable();
                }

                var data = con.Query<dynamic>(queryText).ToList();
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
                    _eventLogService.AddDbQueryLog(EventLogCategory.DB_SUCCESS, gridName, queryText);
            }
            catch (Exception ex)
            {
                if (writeLog)
                    _eventLogService.AddDbQueryLog(EventLogCategory.DB_ERROR, gridName, queryText, null, ex.Message);
                _logger.LogError(ex.Message, ex);
                throw new DepException("An Error in the query has occurred: " + ex.Message);
            }
            finally
            {
                con.Close();
            }

            return output;
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

        #region Grid detail and config, add, update and remove

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
                var param = GenerateDynamicParameter(new Dictionary<string, object>() { { dataSourceConfig.IdColumn, id } });

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

            return result;
        }

        public List<FormFieldConfig> GetGridDetailConfig(string name, string type)
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
                    TableSchema = dataSourceConfig.TableSchema,
                    TableName = dataSourceConfig.TableName,
                    Columns = columns,
                    QueryText = formLayout.QueryText
                });

                // generate the insert command
                var trans = con.BeginTransaction();

                // add query parameters
                var param = GenerateDynamicParameter(model.AsEnumerable());

                // excute command
                try
                {
                    var affected = con.Execute(queryText, param, trans);
                    trans.Commit();

                    _eventLogService.AddDbQueryLog(EventLogCategory.DB_SUCCESS, name, queryText, param, $"{affected} rows affected.");
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

                // generate the update command
                var trans = con.BeginTransaction();

                // add query parameters
                if (model.ContainsKey(dataSourceConfig.IdColumn))
                    model[dataSourceConfig.IdColumn] = id;
                else
                    model.Add(dataSourceConfig.IdColumn, id);
                var param = GenerateDynamicParameter(model.AsEnumerable());

                // excute command
                try
                {
                    var affected = con.Execute(queryText, param, trans);
                    trans.Commit();

                    _eventLogService.AddDbQueryLog(EventLogCategory.DB_ERROR, name, queryText, param, $"{affected} rows affected.");
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

            using (var con = _serviceProvider.GetRequiredService<DbConnection>())
            {
                con.ConnectionString = config.DataSourceConnection.ConnectionString;
                con.Open();
                var trans = con.BeginTransaction();

                try
                {
                    var param = GenerateDynamicParameter(
                        new List<KeyValuePair<string, object>>() {
                            new KeyValuePair<string, object>(dataSourceConfig.IdColumn, ids)
                        }
                    );

                    con.Execute(queryText, param, trans);
                    trans.Commit();
                }
                catch (Exception ex)
                {
                    trans.Rollback();

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

        #endregion

        #region private method

        private object GenerateDynamicParameter(IEnumerable<KeyValuePair<string, object>> keyValues)
        {
            var dict = new Dictionary<string, object>();
            foreach (var item in keyValues)
            {
                var jsonElement = JsonSerializer.Deserialize<JsonElement>(JsonSerializer.Serialize(item.Value));
                dict.Add(_queryBuilder.ParameterName(item.Key), _queryBuilder.GetJsonElementValue(jsonElement));
            }

            dynamic param = dict.Aggregate(
                new ExpandoObject() as IDictionary<string, object>,
                (a, p) => { a.Add(p); return a; }
            );

            return (object)param;
        }

        #endregion
    }
}
