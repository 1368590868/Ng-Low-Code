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
    public interface IQueryBuilder
    {
        // ultilities
        string UsePagination(string query, int startIndex, int indexCount, List<SortParam> sortParams);
        string UseOrderBy(string query, List<SortParam> sortParams = null);
        string UseFilters(string query, List<FilterParam> filterParams = null);
        string UseSearches(string query, List<FilterParam> filterParams = null);
        string GetFilterType(DataRow schema);
        string ParameterName(string name);
        object GetJsonElementValue(JsonElement jsonElement);
        object TransformValue(object value, DataRow schema);

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

        // for lookup
        (string, List<KeyValuePair<string, object>>) ProcessQueryWithParamters(string queryText, Dictionary<string, JsonElement> model);
    }

    public abstract class QueryBuilder
    {
        protected abstract string ParameterPrefix { get; }

        #region Ultilities

        protected virtual string GenerateWhereClause(List<FilterParam> filterParams)
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

        protected abstract string GenerateCriteriaClause(FilterParam item);

        protected virtual string GenerateOrderClause(List<SortParam> sortParams)
        {
            List<string> orders = new List<string>();
            if (sortParams.Count > 0)
            {
                foreach (var item in sortParams)
                {
                    string field = item.field;
                    if (item.order == 1)
                    {
                        orders.Add($"{EscapeColumnName(field)} ASC ");
                    }
                    else
                    {
                        orders.Add($"{EscapeColumnName(field)} DESC ");
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

        public virtual string UsePagination(string query, int startIndex, int indexCount, List<SortParam> sortParams)
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
                SELECT AllData.*, (SELECT COUNT(*) FROM AllData) AS DEP_TOTAL
                FROM AllData
                WHERE DEP_ROWNUMBER > {startIndex} AND DEP_ROWNUMBER < {startIndex + indexCount}
            ";

            return queryText;
        }

        public virtual string UseOrderBy(string query, List<SortParam> sortParams = null)
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

        protected virtual string RemoveOrderBy(string queryText)
        {
            queryText = queryText.Replace("##ORDERBY##", "1");
            var noOrderByRegExp = new Regex("(?:\\s+order\\s+by\\s+1)", RegexOptions.IgnoreCase);
            queryText = noOrderByRegExp.Replace(queryText, "");
            return queryText;
        }

        public virtual string UseFilters(string query, List<FilterParam> filterParams = null)
        {
            if (filterParams == null) filterParams = new List<FilterParam>();

            var where = GenerateWhereClause(filterParams);

            return where.Any()
                ? query.Replace("##FILTERS##", $" ({string.Join(" AND ", where)}) ")
                : query.Replace("##FILTERS##", " 1=1 ");
        }

        public virtual string UseSearches(string query, List<FilterParam> filterParams = null)
        {
            if (filterParams == null) filterParams = new List<FilterParam>();

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

            return filters.Any()
                ? query.Replace("##SEARCHES##", $" ({string.Join(" AND ", filters)}) ")
                : query.Replace("##SEARCHES##", " 1=1");
        }

        public virtual string GetFilterType(DataRow schema)
        {
            var type = (Type)schema["DataType"];
            if (type == typeof(int) || type == typeof(long) || type == typeof(short) ||
                    type == typeof(float) || type == typeof(decimal) || type == typeof(double) ||
                    type == typeof(TimeSpan))
                return "numeric";
            if (type == typeof(DateTime))
                return "date";
            if (type == typeof(bool))
                return "boolean";
            return "text";
        }

        public virtual object GetJsonElementValue(JsonElement jsonElement)
        {
            if (jsonElement.ValueKind == JsonValueKind.Array)
            {
                return jsonElement.EnumerateArray().Select(m => GetJsonElementValue(m)).ToList();
            }
            else if (jsonElement.ValueKind == JsonValueKind.Object)
            {
                return jsonElement.EnumerateObject().Select(m => GetJsonElementValue(m.Value)).ToList();
            }
            else if (jsonElement.ValueKind == JsonValueKind.Number) return jsonElement.GetDecimal();
            else if (jsonElement.ValueKind == JsonValueKind.True) return 1;
            else if (jsonElement.ValueKind == JsonValueKind.False) return 0;
            else if (jsonElement.ValueKind == JsonValueKind.String)
            {
                DateTime date;
                if (DateTime.TryParse(jsonElement.GetString(), out date))
                {
                    return date;
                }
                Guid guid;
                if (Guid.TryParse(jsonElement.ToString(), out guid))
                {
                    return guid.ToByteArray();
                }
                return jsonElement.GetString();
            }
            else return null;
        }

        protected abstract string EscapeColumnName(string columnName);

        public virtual string ParameterName(string name)
        {
            return string.Format("P_{0}", name);
        }

        public virtual object TransformValue(object value, DataRow schema)
        {
            return value;
        }

        #endregion

        #region Universal Grid

        public virtual string GenerateSqlTextForList(DataSourceConfig config)
        {
            var where = config.Filters.Count > 0 ? string.Join(" AND ", GenerateWhereClause(config.Filters)) : "1=1";

            if (!string.IsNullOrEmpty(config.QueryText))
            {
                // advanced datasource, ingore TableName, Columns, SortBy and Filters setting.
                var queryText = config.QueryText;
                return queryText.Replace("##WHERE##", where);
            }
            else
            {
                var source = string.IsNullOrEmpty(config.TableName) ? config.TableName : $"{config.TableSchema}.{config.TableName}";

                var columns = config.Columns.Count > 0 ? string.Join(",", config.Columns.Select(x => EscapeColumnName(x))) : "*";

                var queryText = $@"SELECT {columns} FROM {source} WHERE {where} AND ##SEARCHES## AND ##FILTERS## ORDER BY ##ORDERBY##";

                return queryText;
            }
        }

        public virtual string GenerateSqlTextForDetail(DataSourceConfig config)
        {
            var queryText = GenerateSqlTextForList(config);
            queryText = UseSearches(queryText);
            queryText = UseFilters(queryText);
            queryText = RemoveOrderBy(queryText);

            return $@"SELECT * FROM ({queryText}) A WHERE {EscapeColumnName(config.IdColumn)} = {ParameterPrefix}{ParameterName(config.IdColumn)}";
        }

        public virtual string GenerateSqlTextForInsert(DataSourceConfig config)
        {
            if (!string.IsNullOrEmpty(config.QueryText))
            {
                // advanced datasource, ingore other setting.
                return ReplaceQueryParamters(config.QueryText);
            }
            else
            {
                if (config.Columns.Count <= 0) throw new Exception("Columns can not be empty during generating insert script.");

                var source = string.IsNullOrEmpty(config.TableName) ? config.TableName : $"{config.TableSchema}.{config.TableName}";

                var columns = string.Join(",", config.Columns.Select(x => EscapeColumnName(x)));

                var param = string.Join(",", config.Columns.Select(x => $"{ParameterPrefix}{ParameterName(x)}"));

                var queryText = $@"INSERT INTO {source} ({columns}) VALUES ({param})";

                return queryText;
            }
        }

        public virtual string GenerateSqlTextForUpdate(DataSourceConfig config)
        {
            if (!string.IsNullOrEmpty(config.QueryText))
            {
                // advanced datasource, ingore other setting.
                var queryText = ReplaceQueryParamters(config.QueryText);

                if (!queryText.Contains($"{ParameterPrefix}{ParameterName(config.IdColumn)}"))
                    throw new DepException("There is no parameter for Id in query text. All records in database may be updated.");

                return queryText;
            }
            else
            {
                if (config.Columns.Count <= 0) throw new Exception("Columns can not be empty during generating update script.");

                var source = string.IsNullOrEmpty(config.TableName) ? config.TableName : $"{config.TableSchema}.{config.TableName}";

                var sets = string.Join(", ", config.Columns.Select(x => $"{EscapeColumnName(x)}={ParameterPrefix}{ParameterName(x)}"));

                var queryText = $@"UPDATE {source} SET {sets} WHERE {EscapeColumnName(config.IdColumn)} = {ParameterPrefix}{ParameterName(config.IdColumn)}";

                return queryText;
            }
        }

        public virtual string GenerateSqlTextForDelete(DataSourceConfig config)
        {
            if (!string.IsNullOrEmpty(config.QueryText))
            {
                // advanced datasource, ingore other setting.
                var queryText = ReplaceQueryParamters(config.QueryText);

                if (!queryText.Contains($"{ParameterPrefix}{ParameterName(config.IdColumn)}"))
                    throw new DepException("There is no parameter for Id in query text. All records in database may be deleted.");

                return queryText;
            }
            else
            {
                var source = string.IsNullOrEmpty(config.TableName) ? config.TableName : $"{config.TableSchema}.{config.TableName}";
                var queryText = $@"DELETE FROM {source} WHERE {EscapeColumnName(config.IdColumn)} IN {ParameterPrefix}{ParameterName(config.IdColumn)}";

                return queryText;
            }
        }

        public virtual string GenerateSqlTextForColumnFilterOption(DataSourceConfig config)
        {
            if (!string.IsNullOrEmpty(config.QueryText))
            {
                var columns = config.Columns.Count > 0 ? string.Join(",", config.Columns.Select(x => EscapeColumnName(x))) : "*";

                var queryText = GenerateSqlTextForList(config);
                queryText = UseSearches(queryText);
                queryText = UseFilters(queryText);
                queryText = RemoveOrderBy(queryText);

                return $@"SELECT DISTINCT {columns} FROM ({queryText}) A";
            }
            else
            {
                var source = string.IsNullOrEmpty(config.TableName) ? config.TableName : $"{config.TableSchema}.{config.TableName}";

                var columns = config.Columns.Count > 0 ? string.Join(",", config.Columns.Select(x => EscapeColumnName(x))) : "*";

                var where = config.Filters.Count > 0 ? string.Join(" AND ", GenerateWhereClause(config.Filters)) : "1=1";

                var queryText = $@"SELECT DISTINCT {columns} FROM {source} WHERE {where}";

                return queryText;
            }
        }

        #endregion

        public (string, List<KeyValuePair<string, object>>) ProcessQueryWithParamters(string queryText, Dictionary<string, JsonElement> model)
        {
            var fieldRegex = new Regex(@"\#\#([a-zA-Z]{1}[a-zA-Z0-9_]+?)\#\#");
            var regex = new Regex(@"\{\{(.+?)\}\}");
            var optionalCriterias = regex.Matches(queryText);

            var keyValuePairs = new List<KeyValuePair<string, object>>();

            // process optional criterias
            foreach (Match match in optionalCriterias)
            {
                // check the value in model.
                var fieldMatch = fieldRegex.Match(match.Value);
                var key = fieldMatch.Groups[1].Value;

                object value = null;
                if (model.ContainsKey(key))
                    value = GetJsonElementValue(model[key]);

                if (value == null)
                {
                    // do not have value passed in for this field. 
                    // then we dont need to apply this criteria, replace it with empty.
                    queryText = queryText.Replace(match.Value, "");
                }
                else
                {
                    if (new Regex(@$"IN {fieldMatch.Value.ToUpper()}").IsMatch(match.Value.ToUpper()) && !(value is IEnumerable<object>))
                    {
                        // check the operator, if it is "IN", but value is not IEnumerable<object>
                        // we dont need to apply this criteria, replace it with empty.
                        queryText = queryText.Replace(match.Value, "");
                    }
                    else
                    {
                        keyValuePairs.Add(new KeyValuePair<string, object>(ParameterName(key), value));

                        var criteria = match.Groups[1].Value.Replace(fieldMatch.Value, $"{ParameterPrefix}{ParameterName(key)}");
                        queryText = queryText.Replace(match.Value, criteria);
                    }

                }
            }

            // process required criterias
            var matches = fieldRegex.Matches(queryText);
            foreach (Match match in matches)
            {
                var key = match.Groups[1].Value;

                object value = null;
                if (model.ContainsKey(key))
                    value = GetJsonElementValue(model[key]);

                if (new Regex(@$"IN {match.Value.ToUpper()}").IsMatch(queryText.ToUpper()))
                {
                    // check the operator, if it is "IN", value should be IEnumerable<object>
                    // If not, we need to default the value to empty array.
                    if (value != null && value is IEnumerable<object>)
                        keyValuePairs.Add(new KeyValuePair<string, object>(ParameterName(key), value));
                    else
                        keyValuePairs.Add(new KeyValuePair<string, object>(ParameterName(key), new object[] { }));
                }
                else
                {
                    if (value != null) keyValuePairs.Add(new KeyValuePair<string, object>(ParameterName(key), value));
                    else keyValuePairs.Add(new KeyValuePair<string, object>(ParameterName(key), null));
                }
                queryText = queryText.Replace(match.Value, $"{ParameterPrefix}{ParameterName(key)}");
            }

            return (queryText, keyValuePairs);
        }

        public string ReplaceQueryParamters(string queryText)
        {
            var fieldRegex = new Regex(@"\#\#([a-zA-Z]{1}[a-zA-Z0-9_]+?)\#\#");

            var fieldCriterias = fieldRegex.Matches(queryText);

            foreach (Match match in fieldCriterias)
            {
                var key = match.Groups[1].Value;
                queryText = queryText.Replace(match.Value, $"{ParameterPrefix}{ParameterName(key)}");
            }

            return queryText;
        }
    }
}
