using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Web.Models.UniversalGrid;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
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

        Dictionary<string, string> GetGridDataDetail(string name, string id);
    }

    public class UniversalGridService : IUniversalGridService
    {

        private readonly DepDbContext _depDbContext;
        private readonly IDbSqlBuilder _dbSqlBuilder;

        public UniversalGridService(
            DepDbContext depDbContext,
            IDbSqlBuilder dbSqlBuilder)
        {
            _depDbContext = depDbContext;
            _dbSqlBuilder = dbSqlBuilder;
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
                    output.errormessage = "An Error in the query has occurred: " + ex.Message;
                    return output;
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

        #endregion
    }
}
