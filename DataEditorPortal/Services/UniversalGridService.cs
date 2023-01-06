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
        public List<GridColConfig> GetGridColumnsConfig(string name);

        public List<SearchConfig> GetGridSearchConfig(string name);

        public GridData GetGridData(string name, GridParam param);
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
            var queryText = _dbSqlBuilder.GenerateSqlText(dataSourceConfig);

            // convert search criteria to where clause
            // var searchBy = _dbSqlBuilder.GenerateWhereClause(param.Filters);
            var searchConfig = JsonSerializer.Deserialize<List<SearchConfig>>(config.SearchConfig);
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

        public List<SearchConfig> GetGridSearchConfig(string name)
        {
            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == name);
            if (config == null) throw new Exception("Grid configuration does not exists with name: " + name);

            if (string.IsNullOrEmpty(config.SearchConfig)) config.SearchConfig = "[]";

            var result = JsonSerializer.Deserialize<List<SearchConfig>>(config.SearchConfig);

            result.ForEach(x => x.searchRule = null);

            return result;
        }
    }
}
