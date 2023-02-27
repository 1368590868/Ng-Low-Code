using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Models.UniversalGrid;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace DataEditorPortal.Web.Services
{
    public interface IDbSqlBuilder
    {
        // ultilities
        string UsePagination(string query, int startIndex, int indexCount, List<SortParam> sortParams);
        string UseOrderBy(string query, List<SortParam> sortParams = null);
        string UseCount(string query);
        string UseFilters(string query, List<FilterParam> filterParams = null);
        string UseSearches(string query, List<SearchParam> filterParams = null);
        object FormatValue(object value, DataRow schema);

        // universal grid
        string GenerateSqlTextForList(DataSourceConfig config);
        string GenerateSqlTextForDetail(DataSourceConfig config);
        string GenerateSqlTextForInsert(DataSourceConfig config);
        string GenerateSqlTextForUpdate(DataSourceConfig config);
        string GenerateSqlTextForDelete(DataSourceConfig config);

        string GenerateSqlTextForColumnFilterOption(DataSourceConfig config);

        // database
        string GetSqlTextForDatabaseTables();
        string GetSqlTextForDatabaseSource(DataSourceConfig config);
    }

    public class DbSqlServerBuilder : IDbSqlBuilder
    {
        public DbSqlServerBuilder()
        {

        }

        #region Ultilities

        private string GenerateWhereClause(List<FilterParam> filterParams)
        {
            List<string> filters = new List<string>();

            foreach (var item in filterParams)
            {
                if (!string.IsNullOrEmpty(item.value.ToString()))
                {
                    var criteriaStr = GenerateCriteriaClause(item);
                    if (!string.IsNullOrEmpty(criteriaStr))
                        filters.Add(criteriaStr);
                }
            }

            return string.Join(" AND ", filters);
        }

        private string GenerateCriteriaClause(FilterParam item, string whereClause = null)
        {
            string result = string.Empty;

            string field = item.field;
            if (item.dBFieldExpression != null)
            {
                field = item.dBFieldExpression;
            }

            var jsonElement = JsonSerializer.Deserialize<JsonElement>(JsonSerializer.Serialize(item.value));

            if (jsonElement.ValueKind == JsonValueKind.True || jsonElement.ValueKind == JsonValueKind.False)
            {
                var value = jsonElement.GetBoolean();
                if (whereClause != null)
                    result = whereClause.Replace("##VALUE##", (value ? 1 : 0).ToString());
                else
                    result = $"[{field}] = {(value ? 1 : 0)}";
            }
            else if (jsonElement.ValueKind == JsonValueKind.Number)
            {
                var value = jsonElement.GetDecimal();
                if (whereClause != null)
                    result = whereClause.Replace("##VALUE##", value.ToString());
                else
                    switch (item.matchMode)
                    {
                        case "gt":
                            result = $"[{field}] > {value}";
                            break;

                        case "lt":
                            result = $"[{field}] < {value}";
                            break;

                        case "gte":
                            result = $"[{field}] >= {value}";
                            break;

                        case "lte":
                            result = $"[{field}] <= {value}";
                            break;

                        case "equals":
                            result = $"[{field}] = {value}";
                            break;

                        case "notEquals":
                            result = $"[{field}] <> {value}";
                            break;

                        default:
                            break;
                    }
            }
            else if (jsonElement.ValueKind == JsonValueKind.Array)
            {
                if (jsonElement.GetArrayLength() > 0)
                {
                    var inStr = "";
                    jsonElement.EnumerateArray().ToList().ForEach(value =>
                    {
                        if (value.ValueKind == JsonValueKind.Number)
                        {
                            inStr += $",'{value.GetDecimal()}'";
                        }
                        else
                        {
                            inStr += $",'{value.GetString().Replace("'", "''")}'";
                        }
                    });
                    if (whereClause != null)
                        result = whereClause.Replace("##VALUE##", inStr.Substring(1));
                    else
                        result = $"[{field}] IN ({inStr.Substring(1)})";
                }
            }
            else if (jsonElement.ValueKind == JsonValueKind.String)
            {
                var value = jsonElement.GetString().Replace("'", "''");
                if (whereClause != null)
                    result = whereClause.Replace("##VALUE##", value.ToString());
                else
                    switch (item.matchMode)
                    {
                        case "startsWith":
                            result = $"[{field}] like '{value}%'";
                            break;

                        case "contains":
                            result = $"[{field}] like '%{value}%'";
                            break;

                        case "notContains":
                            result = $"[{field}] not like '%{value}%'";
                            break;

                        case "endsWith":
                            result = $"[{field}] like '%{value}'";
                            break;

                        case "equals":
                            result = $"[{field}] = '{value}'";
                            break;

                        case "notEquals":
                            result = $"[{field}] <> '{value}'";
                            break;

                        case "dateIs":
                            result = $"[{field}] = '{jsonElement.GetDateTime():yyyy/MM/dd}'";
                            break;

                        case "dateIsNot":
                            result = $"[{field}] <> '{jsonElement.GetDateTime():yyyy/MM/dd}'";
                            break;

                        case "dateBefore":
                            result = $"[{field}] < '{jsonElement.GetDateTime():yyyy/MM/dd}'";
                            break;

                        case "dateAfter":
                            result = $"[{field}] > '{jsonElement.GetDateTime():yyyy/MM/dd}'";
                            break;
                        default:
                            break;
                    }
            }

            return result;
        }

        private string GenerateOrderClause(List<SortParam> sortParams)
        {
            List<string> orders = new List<string>();
            if (sortParams.Count > 0)
            {
                foreach (var item in sortParams)
                {

                    string field = item.field;
                    if (item.dBFieldExpression != null)
                    {
                        field = item.dBFieldExpression;
                    }


                    if (item.order == 1)
                    {
                        orders.Add($"[{field}] ASC ");
                    }
                    else
                    {
                        orders.Add($"[{field}] DESC ");
                    }
                }
            }

            string orderby = "";
            if (orders.Count > 0)
            {
                orderby = string.Join(",", orders);
            }

            return orderby;
        }

        public string UsePagination(string query, int startIndex, int indexCount, List<SortParam> sortParams)
        {
            if (sortParams == null || !sortParams.Any())
                throw new DepException("The paged query cannot be executed without the orderBy set");

            var orderby = GenerateOrderClause(sortParams);
            var queryWithoutOrderBy = RemoveOrderBy(query);

            var queryText = $@"
                WITH AllData AS
                (
                    SELECT ROW_NUMBER() OVER(ORDER BY {orderby}) AS DEP_ROWNUMBER, A.*
                    FROM (
                        {queryWithoutOrderBy}
                    ) A
                ) 
                SELECT *, (SELECT COUNT(*) FROM AllData) AS DEP_TOTAL
                FROM AllData
                WHERE DEP_ROWNUMBER > {startIndex} AND DEP_ROWNUMBER < {startIndex + indexCount};
            ";

            return queryText;
        }

        public string UseOrderBy(string query, List<SortParam> sortParams = null)
        {
            if (sortParams == null) sortParams = new List<SortParam>();

            var orderByClause = GenerateOrderClause(sortParams);

            if (string.IsNullOrEmpty(orderByClause))
            {
                query = RemoveOrderBy(query);
            }
            else
            {
                query = query.Replace("##ORDERBY##", orderByClause);
            }
            return query;
        }

        private string RemoveOrderBy(string queryText)
        {
            queryText = queryText.Replace("##ORDERBY##", "1");
            var noOrderByRegExp = new Regex("(?:\\s+order\\s+by\\s+1)", RegexOptions.IgnoreCase);
            queryText = noOrderByRegExp.Replace(queryText, "");
            return queryText;
        }

        public string UseFilters(string query, List<FilterParam> filterParams = null)
        {
            if (filterParams == null) filterParams = new List<FilterParam>();

            var where = GenerateWhereClause(filterParams);

            return where.Any()
                ? query.Replace("##FILTERS##", $" AND ({string.Join(" AND ", where)}) ")
                : query.Replace("##FILTERS##", "");
        }

        public string UseSearches(string query, List<SearchParam> filterParams = null)
        {
            if (filterParams == null) filterParams = new List<SearchParam>();

            List<string> filters = new List<string>();

            foreach (var item in filterParams)
            {
                if (!string.IsNullOrEmpty(item.value.ToString()))
                {
                    var criteriaStr = GenerateCriteriaClause(item, item.whereClause);
                    if (!string.IsNullOrEmpty(criteriaStr))
                        filters.Add(criteriaStr);
                }
            }

            return filters.Any()
                ? query.Replace("##SEARCHES##", $" AND ({string.Join(" AND ", filters)}) ")
                : query.Replace("##SEARCHES##", "");
        }

        public string UseCount(string query)
        {
            var queryWithoutOrderBy = query;

            var index = query.IndexOf("ORDER BY", StringComparison.InvariantCultureIgnoreCase);
            if (index > 0)
            {
                queryWithoutOrderBy = query.Substring(0, index);
            }

            return $"SELECT COUNT(*) FROM ({queryWithoutOrderBy}) A";
        }

        public object FormatValue(object value, DataRow schema)
        {
            if (value == System.DBNull.Value) return string.Empty;

            var sqlDbType = (SqlDbType)schema["ProviderType"];
            if (sqlDbType == SqlDbType.Date) return Convert.ToDateTime(value);
            if (sqlDbType == SqlDbType.DateTime || sqlDbType == SqlDbType.DateTime2 || sqlDbType == SqlDbType.SmallDateTime)
                return Convert.ToDateTime(value);
            if (sqlDbType == SqlDbType.Float || sqlDbType == SqlDbType.Decimal || sqlDbType == SqlDbType.Money)
                return Convert.ToDecimal(value);
            if (sqlDbType == SqlDbType.Bit)
                return Convert.ToBoolean(value);
            else
                return value.ToString();
        }

        #endregion

        #region Universal Grid

        public string GenerateSqlTextForList(DataSourceConfig config)
        {
            if (!string.IsNullOrEmpty(config.QueryText))
            {
                // advanced datasource, ingore TableName, Columns, SortBy and Filters setting.
                return config.QueryText;
            }
            else
            {
                var columns = config.Columns.Count > 0 ? string.Join(",", config.Columns.Select(x => $"[{x}]")) : "*";

                var where = config.Filters.Count > 0 ? string.Join(" AND ", GenerateWhereClause(config.Filters)) : "1=1";

                //var orderBy = config.SortBy.Count > 0 ? GenerateOrderClause(config.SortBy) : $"[{config.IdColumn}] ASC";

                var queryText = $@"SELECT {columns} FROM {config.TableSchema}.{config.TableName} WHERE {where} ##SEARCHES## ##FILTERS## ORDER BY ##ORDERBY##";

                return queryText;
            }
        }

        public string GenerateSqlTextForDetail(DataSourceConfig config)
        {
            var queryText = GenerateSqlTextForList(config);
            queryText = UseSearches(queryText);
            queryText = UseFilters(queryText);
            queryText = RemoveOrderBy(queryText);

            return $@"SELECT * FROM ({queryText}) A WHERE [{config.IdColumn}] = @{config.IdColumn}";
        }

        public string GenerateSqlTextForInsert(DataSourceConfig config)
        {
            if (!string.IsNullOrEmpty(config.QueryText))
            {
                // advanced datasource, ingore other setting.
                return config.QueryText;
            }
            else
            {
                if (config.Columns.Count <= 0) throw new Exception("Columns can not be empty during generating insert script.");

                var columns = string.Join(",", config.Columns.Select(x => $"[{x}]"));

                var param = string.Join(",", config.Columns.Select(x => $"@{x}"));

                var queryText = $@"INSERT INTO {config.TableSchema}.{config.TableName} ({columns}) VALUES ({param})";

                return queryText;
            }
        }

        public string GenerateSqlTextForUpdate(DataSourceConfig config)
        {
            if (!string.IsNullOrEmpty(config.QueryText))
            {
                // advanced datasource, ingore other setting.
                if (!config.QueryText.Contains($"@{ config.IdColumn}"))
                {
                    throw new DepException("There is no parameter for Id in query text. All records in database may be updated.");
                }
                return config.QueryText;
            }
            else
            {
                if (config.Columns.Count <= 0) throw new Exception("Columns can not be empty during generating update script.");

                var sets = string.Join(",", config.Columns.Select(x => $"[{x}] = @{x}"));

                var queryText = $@"UPDATE {config.TableSchema}.{config.TableName} SET {sets} WHERE [{config.IdColumn}] = @{config.IdColumn}";

                return queryText;
            }
        }

        public string GenerateSqlTextForDelete(DataSourceConfig config)
        {
            if (!string.IsNullOrEmpty(config.QueryText))
            {
                // advanced datasource, ingore other setting.
                return config.QueryText;
            }
            else
            {
                if (config.Filters.Count <= 0) throw new Exception("Filters can not be empty during generating delete script.");

                var where = string.Join(" AND ", GenerateWhereClause(config.Filters));

                var queryText = $@"DELETE FROM {config.TableSchema}.{config.TableName} WHERE {where}";

                return queryText;
            }
        }

        public string GenerateSqlTextForColumnFilterOption(DataSourceConfig config)
        {
            if (!string.IsNullOrEmpty(config.QueryText))
            {
                var columns = config.Columns.Count > 0 ? string.Join(",", config.Columns.Select(x => $"[{x}]")) : "*";

                return $@"SELECT DISTINCT {columns} FROM ({config.QueryText}) A";
            }
            else
            {
                var columns = config.Columns.Count > 0 ? string.Join(",", config.Columns.Select(x => $"[{x}]")) : "*";

                var where = config.Filters.Count > 0 ? string.Join(" AND ", GenerateWhereClause(config.Filters)) : "1=1";

                var queryText = $@"SELECT DISTINCT {columns} FROM {config.TableSchema}.{config.TableName} WHERE {where}";

                return queryText;
            }
        }

        #endregion

        #region Database 

        /// <summary>
        /// Sql to get all tables from database, the first column should be table name and second column should be table schema.
        /// </summary>
        /// <returns></returns>
        public string GetSqlTextForDatabaseTables()
        {
            return $"SELECT TABLE_NAME AS TableName, TABLE_SCHEMA AS TableSchema FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA <> 'dep' AND TABLE_TYPE  = 'BASE TABLE'";
        }

        public string GetSqlTextForDatabaseSource(DataSourceConfig config)
        {
            if (!string.IsNullOrEmpty(config.QueryText))
            {
                var sqlText = GenerateSqlTextForList(config);
                sqlText = UseSearches(sqlText);
                sqlText = UseFilters(sqlText);
                return $"SELECT TOP 1 * FROM ({sqlText}) AS A";

            }
            else
            {
                return $"SELECT TOP 1 * FROM {config.TableSchema}.{config.TableName}";
            }

        }

        #endregion
    }
}
