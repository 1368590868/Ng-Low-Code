using DataEditorPortal.Data.Common;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Models.UniversalGrid;
using System;
using System.Collections.Generic;
using System.Data;
using System.Dynamic;
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
        object GetJsonElementValue(object value);
        object TransformValue(object value, DataRow schema);
        object GenerateDynamicParameter(IEnumerable<KeyValuePair<string, object>> keyValues);
        string ReplaceQueryParamters(string queryText);
        string JoinAttachments(string query, IEnumerable<GridColConfig> attachmentCols);

        // universal grid
        string GenerateSqlTextForDatasource(DataSourceConfig config);
        string GenerateSqlTextForList(DataSourceConfig config);
        string GenerateSqlTextForDetail(DataSourceConfig config, bool multiple = false);
        string GenerateSqlTextForInsert(DataSourceConfig config);
        string GenerateSqlTextForUpdate(DataSourceConfig config);
        string GenerateSqlTextForDelete(DataSourceConfig config);
        string GenerateSqlTextForExist(DataSourceConfig config);
        string GenerateSqlTextForLinkData(TableMeta t1, TableMeta t2, string queryAllRelations = null, bool inputIsPrimary = true);
        string GenerateSqlTextForDeleteLinkData(RelationDataSourceConfig config, TableMeta input, TableMeta output);
        string GenerateSqlTextForQueryForeignKeyValue(TableMeta input);
        string GenerateSqlTextForRemoveRelation(DataSourceConfig config, bool isOneToMany);
        string GenerateSqlTextForAddRelation(DataSourceConfig config, bool isOneToMany);

        string GenerateSqlTextForColumnFilterOption(DataSourceConfig config);

        // database
        string GetSqlTextForDatabaseTables(bool useSchemaRule, bool useTableNameRule);
        string GetSqlTextForDatabaseSource(DataSourceConfig config);

        // for lookup
        (string, List<KeyValuePair<string, object>>) ProcessQueryWithParamters(string queryText, IDictionary<string, object> model);
    }

    public abstract class QueryBuilder
    {
        protected readonly IUtcLocalConverter _utcLocalConverter;
        public QueryBuilder(IUtcLocalConverter dateTimeValueConverter)
        {
            _utcLocalConverter = dateTimeValueConverter;
        }

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
            var queryWithoutOrderBy = RemoveOrderBy(query, out var _);

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
                query = RemoveOrderBy(query, out var _);
            }
            else
            {
                query = query.Replace("##ORDERBY##", orderByClause);
            }
            return query;
        }

        protected virtual string RemoveOrderBy(string queryText, out string orderByQuery)
        {
            queryText = queryText.Replace("##ORDERBY##", "~ORDERBY~");

            var pattern = @"ORDER\s+BY\s+~ORDERBY~";
            var queryWithoutOrderby = string.Empty;
            orderByQuery = string.Empty;
            Match match = Regex.Match(queryText, pattern, RegexOptions.IgnoreCase);
            if (match.Success)
            {
                orderByQuery = match.Groups[0].Value.Replace("~ORDERBY~", "##ORDERBY##");
                queryWithoutOrderby = Regex.Replace(queryText, pattern, string.Empty, RegexOptions.IgnoreCase);
            }
            else
                queryWithoutOrderby = queryText;

            return queryWithoutOrderby;
        }

        public virtual string UseFilters(string query, List<FilterParam> filterParams = null)
        {
            if (filterParams == null) filterParams = new List<FilterParam>();

            var where = GenerateWhereClause(filterParams);

            return where.Any()
                ? query.Replace("##FILTERS##", $"({string.Join(" AND ", where)})")
                : query.Replace("##FILTERS##", "1=1");
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
                ? query.Replace("##SEARCHES##", $"({string.Join(" AND ", filters)})")
                : query.Replace("##SEARCHES##", "1=1");
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

        public virtual object GetJsonElementValue(object value)
        {
            if (value is byte[]) return value;

            JsonElement jsonElement;
            if (value is JsonElement) jsonElement = (JsonElement)value;
            else jsonElement = JsonSerializer.Deserialize<JsonElement>(JsonSerializer.Serialize(value));

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
                if (Regex.IsMatch(jsonElement.GetString(), @"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$"))
                {
                    var formats = new string[] { "yyyy-MM-ddTHH:mm:ss.FFFFFFFK", "", "" };
                    DateTime date;
                    if (DateTime.TryParseExact(jsonElement.GetString(), formats, null, System.Globalization.DateTimeStyles.None, out date))
                    {
                        return _utcLocalConverter.Converter.ConvertToProvider.Invoke(date);
                    }
                }
                return jsonElement.GetString();
            }
            else return null;
        }

        protected abstract string EscapeColumnName(string columnName);

        public virtual string ParameterName(string name)
        {
            return string.Format("P_{0}", name.Replace(".", "_"));
        }

        public virtual object TransformValue(object value, DataRow schema)
        {
            if (value == null || value == DBNull.Value) return value;

            var type = value.GetType();

            if (type == typeof(DateTime))
            {
                return _utcLocalConverter.Converter.ConvertFromProvider(value);
            }

            return value;
        }

        public virtual object GenerateDynamicParameter(IEnumerable<KeyValuePair<string, object>> keyValues)
        {
            var dict = new Dictionary<string, object>();
            foreach (var item in keyValues)
            {
                dict.Add(ParameterName(item.Key), GetJsonElementValue(item.Value));
            }

            dynamic param = dict.Aggregate(
                new ExpandoObject() as IDictionary<string, object>,
                (a, p) => { a.Add(p); return a; }
            );

            return (object)param;
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

                if (config.Columns.Count > 0 && !config.Columns.Contains(config.IdColumn)) config.Columns.Add(config.IdColumn);

                var columns = config.Columns.Count > 0 ? string.Join(",", config.Columns.Select(x => EscapeColumnName(x))) : "*";

                var queryText = $@"SELECT {columns} FROM {source} WHERE {where} AND ##SEARCHES## AND ##FILTERS## ORDER BY ##ORDERBY##";

                return queryText;
            }
        }

        public virtual string GenerateSqlTextForDatasource(DataSourceConfig config)
        {
            var queryText = GenerateSqlTextForList(config);
            queryText = UseSearches(queryText);
            queryText = UseFilters(queryText);
            queryText = RemoveOrderBy(queryText, out var _);
            return queryText;
        }

        public virtual string GenerateSqlTextForDetail(DataSourceConfig config, bool multiple = false)
        {
            var queryText = GenerateSqlTextForDatasource(config);

            return $@"SELECT * FROM ({queryText}) A WHERE {EscapeColumnName(config.IdColumn)} {(multiple ? "IN" : "=")} {ParameterPrefix}{ParameterName(config.IdColumn)}";
        }

        public abstract string GenerateSqlTextForInsert(DataSourceConfig config);

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
                queryText = RemoveOrderBy(queryText, out var _);

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

        public virtual string GenerateSqlTextForExist(DataSourceConfig config)
        {
            var queryText = GenerateSqlTextForList(config);
            queryText = UseSearches(queryText);
            queryText = UseFilters(queryText);
            queryText = RemoveOrderBy(queryText, out var _);

            return $@"SELECT {EscapeColumnName(config.IdColumn)} FROM ({queryText}) A WHERE {EscapeColumnName(config.IdColumn)} IN {ParameterPrefix}{ParameterName(config.IdColumn)}";
        }


        #region query for link table

        public virtual string GenerateSqlTextForLinkData(TableMeta input, TableMeta output, string queryAllRelations = null, bool inputIsPrimary = true)
        {
            if (!string.IsNullOrEmpty(queryAllRelations))
            {
                // many to many
                return $@"
                    SELECT 
                        t1.{EscapeColumnName(input.IdColumn)} AS ""T1_{input.IdColumn}"", 
                        t2.{EscapeColumnName(output.IdColumn)} AS ""T2_{output.IdColumn}"",
                        link.{EscapeColumnName(input.ForeignKey)} AS ""F1_{input.ForeignKey}"", 
                        link.{EscapeColumnName(output.ForeignKey)} AS ""F2_{output.ForeignKey}""
                    FROM ({input.Query_AllData}) t1
                    INNER JOIN ({queryAllRelations}) link ON t1.{EscapeColumnName(input.ReferenceKey)} = link.{EscapeColumnName(input.ForeignKey)} 
                    INNER JOIN ({output.Query_AllData}) t2 ON t2.{EscapeColumnName(output.ReferenceKey)} = link.{EscapeColumnName(output.ForeignKey)} 
                    WHERE t1.{input.IdColumn} = {ParameterPrefix}{ParameterName(input.IdColumn)}
                ";
            }
            else
            {
                if (inputIsPrimary)
                {
                    return $@"
                        SELECT 
                            t1.{EscapeColumnName(input.IdColumn)} AS ""T1_{input.IdColumn}"", 
                            t2.{EscapeColumnName(output.IdColumn)} AS ""T2_{output.IdColumn}""
                        FROM ({input.Query_AllData}) t1
                        INNER JOIN ({output.Query_AllData}) t2 ON t1.{EscapeColumnName(output.ReferenceKey)} = t2.{EscapeColumnName(output.ForeignKey)} 
                        WHERE t1.{input.IdColumn} = {ParameterPrefix}{ParameterName(input.IdColumn)}
                    ";
                }
                else
                {
                    return $@"
                        SELECT 
                            t1.{EscapeColumnName(input.IdColumn)} AS ""T1_{input.IdColumn}"", 
                            t2.{EscapeColumnName(output.IdColumn)} AS ""T2_{output.IdColumn}""
                        FROM ({input.Query_AllData}) t1
                        INNER JOIN ({output.Query_AllData}) t2 ON t2.{EscapeColumnName(output.ReferenceKey)} = t1.{EscapeColumnName(output.ForeignKey)} 
                        WHERE t1.{input.IdColumn} = {ParameterPrefix}{ParameterName(input.IdColumn)}
                    ";
                }
            }
        }

        public virtual string GenerateSqlTextForDeleteLinkData(RelationDataSourceConfig config, TableMeta input, TableMeta output)
        {
            if (config.IsOneToMany)
            {
                return $@"
                    UPDATE {output.TableSchema}.{output.TableName} SET {output.ForeignKey} = NULL 
                    WHERE {output.ForeignKey} IN (
                        SELECT {input.ReferenceKey} FROM ({input.Query_AllData}) t1
                        WHERE t1.{input.IdColumn} IN {ParameterPrefix}{ParameterName(input.IdColumn)}
                    )
                ";
            }
            else
            {
                return $@"
                    DELETE FROM {config.TableSchema}.{config.TableName}
                    WHERE {EscapeColumnName(input.ForeignKey)} IN (
                        SELECT link.{EscapeColumnName(input.ForeignKey)} 
                        FROM {config.TableSchema}.{config.TableName} link
                        INNER JOIN ({input.Query_AllData}) t1 ON link.{EscapeColumnName(input.ForeignKey)} = t1.{EscapeColumnName(input.ReferenceKey)}
                        WHERE t1.{input.IdColumn} IN {ParameterPrefix}{ParameterName(input.IdColumn)}
                    )
                ";
            }
        }

        public virtual string GenerateSqlTextForQueryForeignKeyValue(TableMeta input)
        {
            var columns = new List<string>() { EscapeColumnName(input.IdColumn) };
            if (input.IdColumn != input.ReferenceKey)
                columns.Add(EscapeColumnName(input.ReferenceKey));

            return $@"SELECT {string.Join(",", columns)} FROM ({input.Query_AllData}) A WHERE {EscapeColumnName(input.IdColumn)} IN {ParameterPrefix}{ParameterName(input.IdColumn)}";
        }

        public virtual string GenerateSqlTextForAddRelation(DataSourceConfig config, bool isOneToMany)
        {
            if (isOneToMany)
            {
                //var sets = string.Join(", ", config.Columns.Select(x => $"{EscapeColumnName(x)}={ParameterPrefix}{ParameterName(x)}"));

                //var source = string.IsNullOrEmpty(config.TableName) ? config.TableName : $"{config.TableSchema}.{config.TableName}";
                //return $@"UPDATE {source} SET {sets} WHERE {EscapeColumnName(config.IdColumn)} = {ParameterPrefix}{ParameterName(config.IdColumn)}";
                return GenerateSqlTextForUpdate(config);
            }
            else
            {
                //return GenerateSqlTextForInsert(config);
                if (!string.IsNullOrEmpty(config.QueryText))
                {
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
        }
        public virtual string GenerateSqlTextForRemoveRelation(DataSourceConfig config, bool isOneToMany)
        {
            if (isOneToMany)
            {
                //var sets = string.Join(", ", config.Columns.Select(x => $"{EscapeColumnName(x)}=NULL"));

                //var source = string.IsNullOrEmpty(config.TableName) ? config.TableName : $"{config.TableSchema}.{config.TableName}";
                //return $@"UPDATE {source} SET {sets} WHERE {EscapeColumnName(config.IdColumn)} = {ParameterPrefix}{ParameterName(config.IdColumn)}";
                return GenerateSqlTextForUpdate(config);
            }
            else
            {
                var where = config.Filters.Select(x => { return $@"{EscapeColumnName(x.field)} = {ParameterPrefix}{ParameterName(x.field)}"; });
                if (where.Count() < 2) throw new DepException("Two criterias are required when remove Many to Many relation.");

                var source = string.IsNullOrEmpty(config.TableName) ? config.TableName : $"{config.TableSchema}.{config.TableName}";
                return $@"DELETE FROM {source} WHERE {string.Join(" AND ", where)}";
            }
        }

        #endregion

        #endregion

        public (string, List<KeyValuePair<string, object>>) ProcessQueryWithParamters(string queryText, IDictionary<string, object> model)
        {
            var fieldRegex = new Regex(@"\#\#([a-zA-Z]{1}[a-zA-Z0-9_]+?)\#\#");
            var regex = new Regex(@"\{\{(.+?)\}\}");
            var optionalCriterias = regex.Matches(queryText);

            var keyValuePairs = new List<KeyValuePair<string, object>>();

            model = model.AsEnumerable()
                .Select(x => new KeyValuePair<string, object>(x.Key.ToUpper(), x.Value))
                .ToDictionary(x => x.Key, x => x.Value);

            // process optional criterias
            foreach (Match match in optionalCriterias)
            {
                // check the value in model.
                var fieldMatch = fieldRegex.Match(match.Value);
                var key = fieldMatch.Groups[1].Value.ToUpper();

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
                    if (
                            new Regex(@$"IN {fieldMatch.Value.ToUpper()}").IsMatch(match.Value.ToUpper()) // The criteria is IN operator, it needs value is array
                            && (
                                !(value is IEnumerable<object>) || // value is not an array
                                !(value as IEnumerable<object>).Any() // value is an array but empty
                            )
                        )
                    {
                        // check the operator, if it is "IN", but value is not IEnumerable<object> or empty
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
