﻿using AutoMapper;
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
        GridData QueryGridData(DbConnection con, string queryText);
        MemoryStream ExportExcel(string name, ExportParam param);

        Dictionary<string, dynamic> GetGridDataDetail(string name, string id);
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

        public UniversalGridService(
            IServiceProvider serviceProvider,
            DepDbContext depDbContext,
            IQueryBuilder queryBuilder,
            ILogger<UniversalGridService> logger,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor)
        {
            _serviceProvider = serviceProvider;
            _depDbContext = depDbContext;
            _queryBuilder = queryBuilder;
            _logger = logger;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
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

            var result = new List<string>();
            var columnConfig = columnsConfig.FirstOrDefault(x => x.field == column);
            if (columnConfig != null && columnConfig.filterType == "enums")
            {
                dataSourceConfig.Columns = new List<string>() { columnConfig.field };
                var query = _queryBuilder.GenerateSqlTextForColumnFilterOption(dataSourceConfig);

                using (var con = _serviceProvider.GetRequiredService<DbConnection>())
                {
                    con.ConnectionString = config.DataSourceConnection.ConnectionString;

                    var cmd = con.CreateCommand();
                    cmd.Connection = con;
                    cmd.CommandText = query;

                    try
                    {
                        con.Open();
                        using (var dr = cmd.ExecuteReader())
                        {
                            while (dr.Read())
                            {
                                if (dr[0] != DBNull.Value)
                                    result.Add(dr.GetString(0));
                            }
                        }
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
            var searchRules = new List<SearchParam>();
            if (param.Searches != null)
            {
                searchRules = param.Searches
                    .Where(x => x.Value != null)
                    .Select(x =>
                    {
                        SearchParam param = null;

                        var fieldConfig = searchConfig.FirstOrDefault(s => s.key == x.Key);
                        if (fieldConfig != null && fieldConfig.searchRule != null)
                        {
                            param = new SearchParam
                            {
                                field = fieldConfig.searchRule.field,
                                matchMode = fieldConfig.searchRule.matchMode,
                                dBFieldExpression = fieldConfig.searchRule.dBFieldExpression,
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

                output = QueryGridData(con, queryText);
            }

            return output;
        }

        public GridData QueryGridData(DbConnection con, string queryText)
        {
            var output = new GridData();

            var cmd = con.CreateCommand();
            cmd.Connection = con;
            cmd.CommandText = queryText;

            try
            {
                con.Open();
                using (var dr = cmd.ExecuteReader())
                {
                    var fields = dr.FieldCount;
                    var fieldnames = new string[fields];
                    for (int i = 0; i < fields; i++)
                    {
                        fieldnames[i] = dr.GetName(i);
                    }

                    var schema = dr.GetSchemaTable();

                    while (dr.Read())
                    {
                        var row = new Dictionary<string, dynamic>();
                        for (int i = 0; i < fields; i++)
                        {
                            var typename = dr.GetFieldType(i);
                            row[fieldnames[i]] = _queryBuilder.FormatValue(dr[i], schema.Rows[i]);
                        }
                        output.Data.Add(row);
                    }
                }

                if (output.Data.Any() && output.Data[0].Keys.Contains("DEP_TOTAL"))
                {
                    output.Total = Convert.ToInt32(output.Data[0]["DEP_TOTAL"]);
                }
                foreach (var data in output.Data)
                {
                    if (data.Keys.Contains("DEP_TOTAL")) data.Remove("DEP_TOTAL");
                    if (data.Keys.Contains("DEP_ROWNUMBER")) data.Remove("DEP_ROWNUMBER");
                }
            }
            catch (Exception ex)
            {
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
            var columns = GetGridColumnsConfig(name);

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
                    try
                    {
                        colIndex++;
                        DataParam data = new DataParam()
                        {
                            C2 = colIndex,
                            R2 = rowIndex,
                            Text = row[item.field],
                            Type = item.filterType
                        };
                        sheetData.Add(data);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex.Message, ex);
                    }
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

        #endregion

        #region Grid detail and config, add, update and remove

        public Dictionary<string, dynamic> GetGridDataDetail(string name, string id)
        {
            var config = _depDbContext.UniversalGridConfigurations.Include(x => x.DataSourceConnection).FirstOrDefault(x => x.Name == name);
            if (config == null) throw new DepException("Grid configuration does not exists with name: " + name);

            // get query text for list data from grid config.
            var dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);
            var queryText = _queryBuilder.GenerateSqlTextForDetail(dataSourceConfig);

            var result = new Dictionary<string, dynamic>();
            using (var con = _serviceProvider.GetRequiredService<DbConnection>())
            {
                con.ConnectionString = config.DataSourceConnection.ConnectionString;

                con.Open();
                var cmd = con.CreateCommand();
                cmd.Connection = con;

                try
                {
                    cmd.CommandText = queryText;

                    // always provide Id column parameter
                    var idParam = cmd.CreateParameter();
                    idParam.ParameterName = dataSourceConfig.IdColumn;
                    idParam.Value = id;
                    cmd.Parameters.Add(idParam);

                    using (var dr = cmd.ExecuteReader())
                    {
                        var fields = dr.FieldCount;
                        var fieldnames = new string[fields];
                        for (int i = 0; i < fields; i++)
                        {
                            fieldnames[i] = dr.GetName(i);
                        }

                        var schema = dr.GetSchemaTable();

                        while (dr.Read())
                        {
                            for (int i = 0; i < fields; i++)
                            {
                                result[fieldnames[i]] = _queryBuilder.FormatValue(dr[i], schema.Rows[i]);
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
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
                .Where(x => x.computedConfig == null || x.computedConfig.name == null || !string.IsNullOrEmpty(x.computedConfig.queryText))
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
                var cmd = con.CreateCommand();
                cmd.Connection = con;
                cmd.Transaction = trans;
                cmd.CommandText = queryText;

                // add query parameters
                foreach (var column in columns)
                {
                    var value = model[column].ToString();
                    var param = cmd.CreateParameter();
                    param.ParameterName = column;
                    param.Value = value;
                    cmd.Parameters.Add(param);
                }

                // excute command
                try
                {
                    cmd.ExecuteNonQuery();
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
                var cmd = con.CreateCommand();
                cmd.Connection = con;
                cmd.Transaction = trans;
                cmd.CommandText = queryText;

                // add query parameters
                foreach (var column in columns)
                {
                    var value = model[column].ToString();
                    var param = cmd.CreateParameter();
                    param.ParameterName = column;
                    param.Value = value;
                    cmd.Parameters.Add(param);
                }
                // always provide Id column parameter
                var idParam = cmd.CreateParameter();
                idParam.ParameterName = dataSourceConfig.IdColumn;
                idParam.Value = id;
                cmd.Parameters.Add(idParam);

                // excute command
                try
                {
                    cmd.ExecuteNonQuery();
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

                try
                {
                    var dict = new Dictionary<string, object> { { dataSourceConfig.IdColumn, ids } };
                    dynamic param = dict.Aggregate(
                        new ExpandoObject() as IDictionary<string, object>,
                        (a, p) => { a.Add(p); return a; }
                    );

                    con.Execute(queryText, (object)param);
                }
                catch (Exception ex)
                {
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
                            try
                            {
                                var value = GetComputedValueFromDb(con, field.computedConfig.queryText, field.computedConfig.type);
                                SetModelValue(model, field.key, value);
                            }
                            catch (Exception ex)
                            {
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

        private object GetComputedValueFromDb(DbConnection con, string commandText, CommandType type = CommandType.Text)
        {
            var cmd = con.CreateCommand();
            cmd.Connection = con;
            cmd.CommandType = type;
            cmd.CommandText = commandText;

            var value = cmd.ExecuteScalar();
            return value == DBNull.Value ? null : value;
        }

        private void SetModelValue(Dictionary<string, object> model, string key, object value)
        {
            if (model.Keys.Contains(key)) model[key] = value;
            else
                model.Add(key, value);
        }

        #endregion
    }
}
