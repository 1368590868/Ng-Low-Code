using DataEditorPortal.Data.Contexts;
using DataEditorPortal.ExcelExport;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Models.UniversalGrid;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;

namespace DataEditorPortal.Web.Services
{
    public interface IUniversalGridService
    {
        GridConfig GetGridConfig(string name);
        List<GridColConfig> GetGridColumnsConfig(string name);
        List<SearchFieldConfig> GetGridSearchConfig(string name);
        List<FormFieldConfig> GetGridDetailConfig(string name);

        GridData GetGridData(string name, GridParam param);
        MemoryStream ExportExcel(string name, ExportParam param);

        Dictionary<string, string> GetGridDataDetail(string name, string id);
        bool UpdateGridData(string name, string id, Dictionary<string, object> model);
        bool AddGridData(string name, Dictionary<string, object> model);
        bool DeleteGridData(string name, string[] ids);
    }

    public class UniversalGridService : IUniversalGridService
    {

        private readonly DepDbContext _depDbContext;
        private readonly IDbSqlBuilder _dbSqlBuilder;
        private readonly ILogger<UniversalGridService> _logger;

        public UniversalGridService(
            DepDbContext depDbContext,
            IDbSqlBuilder dbSqlBuilder,
            ILogger<UniversalGridService> logger)
        {
            _depDbContext = depDbContext;
            _dbSqlBuilder = dbSqlBuilder;
            _logger = logger;
        }

        #region Grid cofnig, columns config, search config and list data

        public GridConfig GetGridConfig(string name)
        {
            var item = _depDbContext.SiteMenus.Where(x => x.Name == name).FirstOrDefault();
            if (item == null) throw new System.Exception($"Portal Item with name:{name} deosn't exists");

            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == name);
            if (config == null) throw new Exception("Grid configuration does not exists with name: " + name);

            // get query text for list data from grid config.
            var dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);
            var queryText = _dbSqlBuilder.GenerateSqlTextForList(dataSourceConfig);

            return new GridConfig()
            {
                Name = config.Name,
                DataKey = dataSourceConfig.IdColumn,
                Description = item.Description,
                Caption = item.Label
            };
        }

        public List<GridColConfig> GetGridColumnsConfig(string name)
        {
            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == name);
            if (config == null) throw new Exception("Grid configuration does not exists with name: " + name);

            if (string.IsNullOrEmpty(config.ColumnsConfig)) config.ColumnsConfig = "[]";

            return JsonSerializer.Deserialize<List<GridColConfig>>(config.ColumnsConfig);
        }

        public GridData GetGridData(string name, GridParam param)
        {
            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == name);
            if (config == null) throw new Exception("Grid configuration does not exists with name: " + name);

            // get query text for list data from grid config.
            var dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);
            var queryText = _dbSqlBuilder.GenerateSqlTextForList(dataSourceConfig);

            // convert search criteria to where clause
            // var searchBy = _dbSqlBuilder.GenerateWhereClause(param.Filters);
            var searchConfig = JsonSerializer.Deserialize<List<SearchFieldConfig>>(config.SearchConfig);
            if (param.Searches != null)
            {
                var rules = param.Searches
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

                queryText = _dbSqlBuilder.UseSearches(queryText, rules);
            }

            // convert grid filter to where clause
            // var filterBy = _dbSqlBuilder.GenerateWhereClause(param.Filters);

            // generate Id filter

            queryText = _dbSqlBuilder.UseFilters(queryText, param.Filters);

            // generate order by clause
            if (param.Sorts.Any())
            {
                // replace the order by clause by input Sorts in queryText
                queryText = _dbSqlBuilder.UseOrderBy(queryText, param.Sorts);
            }

            // use pagination
            var pagedQueryText = _dbSqlBuilder.UsePagination(queryText, param.StartIndex, param.IndexCount);
            // generate sql to calculate count
            var totalQueryText = _dbSqlBuilder.UseCount(queryText);

            // run sql query text
            var output = new GridData();
            using (var con = _depDbContext.Database.GetDbConnection())
            {
                con.Open();
                var cmd = con.CreateCommand();
                cmd.Connection = con;

                try
                {
                    cmd.CommandText = totalQueryText;
                    output.Total = int.Parse(cmd.ExecuteScalar().ToString());

                    cmd.CommandText = pagedQueryText;
                    using (var dr = cmd.ExecuteReader())
                    {
                        var fields = dr.FieldCount;
                        var fieldnames = new string[fields];
                        for (int i = 0; i < fields; i++)
                        {
                            fieldnames[i] = dr.GetName(i);
                        }

                        while (dr.Read())
                        {
                            var row = new Dictionary<string, string>();
                            for (int i = 0; i < fields; i++)
                            {
                                row[fieldnames[i]] = dr[i].ToString();
                            }
                            output.Data.Add(row);
                        }
                    }
                }
                catch (Exception ex)
                {
                    throw new Exception("An Error in the query has occurred: " + ex.Message);
                }
            }

            return output;
        }

        public List<SearchFieldConfig> GetGridSearchConfig(string name)
        {
            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == name);
            if (config == null) throw new Exception("Grid configuration does not exists with name: " + name);

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

            string outputFile = Path.Combine("C:\\Temp", System.Guid.NewGuid().ToString() + ".xlsx");
            var exp = new Exporters();
            exp.Addsheet(sheet, sheetData, outputFile);

            var fs = new MemoryStream();
            var f = System.IO.File.OpenRead(outputFile);
            f.CopyTo(fs);
            fs.Seek(0, SeekOrigin.Begin);
            f.Close();
            f.Dispose();

            System.IO.File.Delete(outputFile);
            return fs;
        }

        #endregion

        #region Grid detail and config, add, update and remove

        public Dictionary<string, string> GetGridDataDetail(string name, string id)
        {
            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == name);
            if (config == null) throw new Exception("Grid configuration does not exists with name: " + name);

            // get query text for list data from grid config.
            var dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);

            // get detail config
            var detailConfig = JsonSerializer.Deserialize<DetailConfig>(config.DetailConfig);
            if (detailConfig.UseCustomAction)
            {
                throw new Exception("This universal detail api doesn't support custom action. Please use custom api in custom action.");
            }

            var queryText = _dbSqlBuilder.GenerateSqlTextForDetail(
                new DataSourceConfig()
                {
                    TableName = dataSourceConfig.TableName,
                    Columns = detailConfig.FormConfig.Select(x => x.key).ToList(),
                    Filters = new List<FilterParam>() {
                        new FilterParam() { field = dataSourceConfig.IdColumn, matchMode = "equals", value = id }
                    },
                    QueryText = detailConfig.QueryText
                });

            var result = new Dictionary<string, string>();
            using (var con = _depDbContext.Database.GetDbConnection())
            {
                con.Open();
                var cmd = con.CreateCommand();
                cmd.Connection = con;

                try
                {
                    cmd.CommandText = queryText;
                    using (var dr = cmd.ExecuteReader())
                    {
                        var fields = dr.FieldCount;
                        var fieldnames = new string[fields];
                        for (int i = 0; i < fields; i++)
                        {
                            fieldnames[i] = dr.GetName(i);
                        }

                        while (dr.Read())
                        {
                            result = new Dictionary<string, string>();
                            for (int i = 0; i < fields; i++)
                            {
                                result[fieldnames[i]] = dr[i].ToString();
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    // output.errormessage = "An Error in the query has occurred: " + ex.Message;
                    return result;
                }
            }

            return result;
        }

        public List<FormFieldConfig> GetGridDetailConfig(string name)
        {
            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == name);
            if (config == null) throw new Exception("Grid configuration does not exists with name: " + name);

            if (string.IsNullOrEmpty(config.DetailConfig)) throw new Exception("Grid Detail Config can not be empty.");

            var result = JsonSerializer.Deserialize<DetailConfig>(config.DetailConfig);

            return result.FormConfig;
        }

        public bool AddGridData(string name, Dictionary<string, object> model)
        {
            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == name);
            if (config == null) throw new Exception("Grid configuration does not exists with name: " + name);

            // get query text for list data from grid config.
            var dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);

            // get detail config
            var detailConfig = JsonSerializer.Deserialize<DetailConfig>(config.DetailConfig);
            if (detailConfig.UseCustomAction)
            {
                throw new Exception("This universal detail api doesn't support custom action. Please use custom api in custom action.");
            }

            var columns = detailConfig.FormConfig
                .Select(x => x.key)
                .Where(x => model.Keys.Contains(x) && model[x] != null).ToList();

            var queryText = _dbSqlBuilder.GenerateSqlTextForInsert(new DataSourceConfig()
            {
                TableName = dataSourceConfig.TableName,
                Columns = columns,
                QueryText = detailConfig.QueryForInsert
            });

            using (var con = _depDbContext.Database.GetDbConnection())
            {
                con.Open();
                var cmd = con.CreateCommand();
                cmd.Connection = con;

                try
                {
                    cmd.CommandText = queryText;

                    foreach (var column in columns)
                    {
                        var value = model[column].ToString();
                        var param = cmd.CreateParameter();
                        param.ParameterName = column;
                        param.Value = value;
                        cmd.Parameters.Add(param);
                    }

                    cmd.ExecuteNonQuery();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.Message, ex);
                    throw new DepException("An Error in the query has occurred: " + ex.Message);
                }
            }

            return true;
        }

        public bool UpdateGridData(string name, string id, Dictionary<string, object> model)
        {
            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == name);
            if (config == null) throw new Exception("Grid configuration does not exists with name: " + name);

            // get query text for list data from grid config.
            var dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);

            // get detail config
            var detailConfig = JsonSerializer.Deserialize<DetailConfig>(config.DetailConfig);
            if (detailConfig.UseCustomAction)
            {
                throw new Exception("This universal detail api doesn't support custom action. Please use custom api in custom action.");
            }

            var columns = detailConfig.FormConfig
                .Select(x => x.key)
                .Where(x => model.Keys.Contains(x) && model[x] != null).ToList();

            var queryText = _dbSqlBuilder.GenerateSqlTextForUpdate(new DataSourceConfig()
            {
                TableName = dataSourceConfig.TableName,
                Columns = detailConfig.FormConfig.Select(x => x.key).ToList(),
                Filters = new List<FilterParam>()
                {
                    new FilterParam() { field = dataSourceConfig.IdColumn, matchMode = "equals", value = id }
                },
                QueryText = detailConfig.QueryForUpdate
            });

            using (var con = _depDbContext.Database.GetDbConnection())
            {
                con.Open();
                var cmd = con.CreateCommand();
                cmd.Connection = con;

                try
                {
                    cmd.CommandText = queryText;

                    foreach (var column in columns)
                    {
                        var value = model[column].ToString();
                        var param = cmd.CreateParameter();
                        param.ParameterName = column;
                        param.Value = value;
                        cmd.Parameters.Add(param);
                    }

                    cmd.ExecuteNonQuery();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.Message, ex);
                    throw new DepException("An Error in the query has occurred: " + ex.Message);
                }
            }

            return true;
        }

        public bool DeleteGridData(string name, string[] ids)
        {
            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == name);
            if (config == null) throw new Exception("Grid configuration does not exists with name: " + name);

            // get query text for list data from grid config.
            var dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);

            // get detail config
            var detailConfig = JsonSerializer.Deserialize<DetailConfig>(config.DetailConfig);
            if (detailConfig.UseCustomAction)
            {
                throw new Exception("This universal detail api doesn't support custom action. Please use custom api in custom action.");
            }

            var queryText = _dbSqlBuilder.GenerateSqlTextForDelete(new DataSourceConfig()
            {
                TableName = dataSourceConfig.TableName,
                Filters = new List<FilterParam>()
                {
                    new FilterParam() { field = dataSourceConfig.IdColumn, matchMode = "in", value = $"'{string.Join("','", ids)}'" }
                },
                QueryText = detailConfig.QueryForDelete
            });

            using (var con = _depDbContext.Database.GetDbConnection())
            {
                con.Open();
                var cmd = con.CreateCommand();
                cmd.Connection = con;

                try
                {
                    cmd.CommandText = queryText;
                    cmd.ExecuteNonQuery();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.Message, ex);
                    throw new DepException("An Error in the query has occurred: " + ex.Message);
                }
            }

            return true;
        }

        #endregion
    }
}
