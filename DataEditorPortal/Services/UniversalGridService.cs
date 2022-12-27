using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Web.Models.UniversalGrid;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;

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
        private readonly IServiceProvider _serviceProvider;

        public UniversalGridService(
            DepDbContext depDbContext,
            IDbSqlBuilder dbSqlBuilder,
            IServiceProvider serviceProvider)
        {
            _depDbContext = depDbContext;
            _dbSqlBuilder = dbSqlBuilder;
            _serviceProvider = serviceProvider;
        }

        public List<GridColConfig> GetGridColumnsConfig(string name)
        {
            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == name);
            if (config == null) throw new Exception("Grid configuration does not exists with name: " + name);

            if (string.IsNullOrEmpty(config.ColumnsConfig)) config.ColumnsConfig = "[]";

            return JsonConvert.DeserializeObject<List<GridColConfig>>(config.ColumnsConfig);
        }

        public GridData GetGridData(string name, GridParam param)
        {
            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == name);
            if (config == null) throw new Exception("Grid configuration does not exists with name: " + name);

            // get query text for list data from grid config.
            var dataSourceConfig = JsonConvert.DeserializeObject<DataSourceConfig>(config.DataSourceConfig);
            var queryText = _dbSqlBuilder.GenerateSqlText(dataSourceConfig);

            // convert search criteria to where clause
            var searchBy = _dbSqlBuilder.GenerateWhereClause(param.Filters);

            // convert grid filter to where clause
            var filterBy = _dbSqlBuilder.GenerateWhereClause(param.Filters);

            // generate Id filter

            queryText = _dbSqlBuilder.UseWhereCondition(queryText, new[] { searchBy, filterBy });

            // generate order by clause
            var sortBy = _dbSqlBuilder.GenerateOrderClause(param.Sorts);
            if (param.Sorts.Any())
            {
                // replace the order by clause by input Sorts in queryText
                queryText = _dbSqlBuilder.UseOrderBy(queryText, sortBy);
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

            return JsonConvert.DeserializeObject<List<SearchConfig>>(config.SearchConfig);
        }
    }
}
