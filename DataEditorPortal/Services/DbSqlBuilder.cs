﻿using DataEditorPortal.Web.Models.UniversalGrid;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;

namespace DataEditorPortal.Web.Services
{
    public interface IDbSqlBuilder
    {

        string GenerateSqlTextForList(DataSourceConfig config);
        string UsePagination(string query, int startIndex, int indexCount);
        string UseOrderBy(string query, List<SortParam> sortParams);
        string UseCount(string query);
        string UseFilters(string query, List<FilterParam> filterParams);
        string UseSearches(string query, List<SearchParam> filterParams);

        string GenerateSqlTextForDetail(DataSourceConfig config);
        string GenerateSqlTextForInsert(DataSourceConfig config);
        string GenerateSqlTextForUpdate(DataSourceConfig config);
        string GenerateSqlTextForDelete(DataSourceConfig config);

        string FormatValue(object value, DataRow schema);
    }

    public class DbSqlServerBuilder : IDbSqlBuilder
    {
        public DbSqlServerBuilder()
        {

        }

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

        private string GenerateCriteriaClause(FilterParam item)
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
                result = $"[{field}] = {(value ? 1 : 0)}";
            }
            else if (jsonElement.ValueKind == JsonValueKind.Number)
            {
                var value = jsonElement.GetDecimal();
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
                if (jsonElement.GetArrayLength() > 0 && item.matchMode == "in")
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
                            inStr += $",'{value.GetString()}'";
                        }
                    });
                    result = $"[{field}] IN ({inStr.Substring(1)})";
                }
            }
            else if (jsonElement.ValueKind == JsonValueKind.String)
            {
                var value = jsonElement.GetString().Replace("'", "''");
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

        public string GenerateSqlTextForList(DataSourceConfig config)
        {
            if (config.QueryText != null)
            {
                // advanced datasource, ingore TableName, Columns, SortBy and Filters setting.
                return config.QueryText;
            }
            else
            {
                var columns = config.Columns.Count > 0 ? string.Join(",", config.Columns.Select(x => $"[{x}]")) : "*";

                var where = config.Filters.Count > 0 ? string.Join(" AND ", GenerateWhereClause(config.Filters)) : "1=1";

                var orderBy = config.SortBy.Count > 0 ? GenerateOrderClause(config.SortBy) : $"[{config.IdColumn}] ASC";

                var queryText = $@"SELECT {columns} FROM dep.{config.TableName} WHERE {where} ##SEARCHES## ##FILTERS## ORDER BY {orderBy}";

                return queryText;
            }
        }

        public string UsePagination(string query, int startIndex, int indexCount)
        {
            // get order by clause
            var index = query.IndexOf("ORDER BY", StringComparison.InvariantCultureIgnoreCase);
            if (index <= 0) throw new Exception("The input query doesn't contains order by clause");

            var orderby = query.Substring(index);
            var queryWithoutOrderBy = query.Substring(0, index);

            var queryText = $@"
                WITH OrderedOrders AS
                (
                    SELECT ROW_NUMBER() OVER({orderby}) AS RowNumber, A.*
                    FROM (
                        {queryWithoutOrderBy}
                    ) A
                ) 
                SELECT * FROM OrderedOrders
                WHERE RowNumber > {startIndex} AND RowNumber < {startIndex + indexCount};
            ";

            return queryText;
        }

        public string UseOrderBy(string query, List<SortParam> sortParams)
        {
            var orderByClause = GenerateOrderClause(sortParams);

            // replace the order by clause by input Sorts in queryText
            var index = query.IndexOf("ORDER BY", StringComparison.InvariantCultureIgnoreCase);

            if (index > 0)
            {
                var queryWithoutOrderBy = query.Substring(0, index);
                return $"{queryWithoutOrderBy} ORDER BY {orderByClause}";
            }
            else
            {
                return $"{query} ORDER BY {orderByClause}";
            }
        }

        public string UseFilters(string query, List<FilterParam> filterParams)
        {
            var where = GenerateWhereClause(filterParams);

            return where.Any()
                ? query.Replace("##FILTERS##", $" AND ({string.Join(" AND ", where)}) ")
                : query.Replace("##FILTERS##", "");
        }

        public string UseSearches(string query, List<SearchParam> filterParams)
        {
            List<string> filters = new List<string>();

            foreach (var item in filterParams)
            {
                if (!string.IsNullOrEmpty(item.value.ToString()))
                {
                    if (string.IsNullOrEmpty(item.whereClause))
                    {
                        var criteriaStr = GenerateCriteriaClause(item);
                        if (!string.IsNullOrEmpty(criteriaStr))
                            filters.Add(criteriaStr);
                    }
                    else
                    {
                        filters.Add(string.Format(item.whereClause, item.value.ToString()));
                    }
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

        public string GenerateSqlTextForDetail(DataSourceConfig config)
        {
            if (config.QueryText != null)
            {
                // advanced datasource, ingore other setting.
                return config.QueryText;
            }
            else
            {
                var columns = config.Columns.Count > 0 ? string.Join(",", config.Columns.Select(x => $"[{x}]")) : "*";

                var where = config.Filters.Count > 0 ? string.Join(" AND ", GenerateWhereClause(config.Filters)) : "1=1";

                var queryText = $@"SELECT {columns} FROM dep.{config.TableName} WHERE {where}";

                return queryText;
            }
        }

        public string GenerateSqlTextForInsert(DataSourceConfig config)
        {
            if (config.QueryText != null)
            {
                // advanced datasource, ingore other setting.
                return config.QueryText;
            }
            else
            {
                if (config.Columns.Count <= 0) throw new Exception("Columns can not be empty during generating insert script.");

                var columns = string.Join(",", config.Columns.Select(x => $"[{x}]"));

                var param = string.Join(",", config.Columns.Select(x => $"@{x}"));

                var queryText = $@"INSERT INTO dep.{config.TableName} ({columns}) VALUES ({param})";

                return queryText;
            }
        }

        public string GenerateSqlTextForUpdate(DataSourceConfig config)
        {
            if (config.QueryText != null)
            {
                // advanced datasource, ingore other setting.
                return config.QueryText;
            }
            else
            {
                if (config.Columns.Count <= 0) throw new Exception("Columns can not be empty during generating update script.");
                if (config.Filters.Count <= 0) throw new Exception("Filters can not be empty during generating update script.");

                var sets = string.Join(",", config.Columns.Select(x => $"[{x}] = @{x}"));

                var where = string.Join(" AND ", GenerateWhereClause(config.Filters));

                var queryText = $@"UPDATE dep.{config.TableName} SET {sets} WHERE {where}";

                return queryText;
            }
        }

        public string GenerateSqlTextForDelete(DataSourceConfig config)
        {
            if (config.QueryText != null)
            {
                // advanced datasource, ingore other setting.
                return config.QueryText;
            }
            else
            {
                if (config.Filters.Count <= 0) throw new Exception("Filters can not be empty during generating delete script.");

                var where = string.Join(" AND ", GenerateWhereClause(config.Filters));

                var queryText = $@"DELETE FROM dep.{config.TableName} WHERE {where}";

                return queryText;
            }
        }

        public string FormatValue(object value, DataRow schema)
        {
            var sqlDbType = (SqlDbType)schema["ProviderType"];
            if (sqlDbType == SqlDbType.Date) return Convert.ToDateTime(value).ToString("d");
            if (sqlDbType == SqlDbType.DateTime || sqlDbType == SqlDbType.DateTime2 || sqlDbType == SqlDbType.SmallDateTime)
                return Convert.ToDateTime(value).ToString();
            if (sqlDbType == SqlDbType.Float || sqlDbType == SqlDbType.Decimal || sqlDbType == SqlDbType.Money)
                return Convert.ToDecimal(value).ToString("N2");
            else
                return value.ToString();
        }
    }
}
