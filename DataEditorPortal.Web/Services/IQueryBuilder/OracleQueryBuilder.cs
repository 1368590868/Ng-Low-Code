using DataEditorPortal.Data.Common;
using DataEditorPortal.Web.Models.UniversalGrid;
using Oracle.ManagedDataAccess.Client;
using System;
using System.Collections.Generic;
using System.Data;
using System.Dynamic;
using System.Linq;
using System.Text.Json;

namespace DataEditorPortal.Web.Services
{
    public class OracleQueryBuilder : QueryBuilder, IQueryBuilder
    {
        public OracleQueryBuilder(IUtcLocalConverter dateTimeValueConverter) : base(dateTimeValueConverter) { }

        protected override string ParameterPrefix => ":";

        #region Ultilities

        protected override string GenerateCriteriaClause(FilterParam item, bool useParam = true)
        {
            string field = EscapeColumnName(item.field);
            string parameterOrValue = $"{ParameterPrefix}{ParameterName(item.field)}_{item.index}";

            string clause = string.Empty;
            if (!string.IsNullOrEmpty(item.whereClause))
            {
                if (!useParam) throw new NotSupportedException("Values for custom search rule are not supported to use string format.");

                clause = item.whereClause.Replace("##VALUE##", parameterOrValue);
            }
            else
            {
                var jsonElement = JsonSerializer.Deserialize<JsonElement>(JsonSerializer.Serialize(item.value));

                if (jsonElement.ValueKind == JsonValueKind.True || jsonElement.ValueKind == JsonValueKind.False)
                {
                    if (!useParam) parameterOrValue = jsonElement.GetBoolean() ? "1" : "0";

                    clause = $"{field} = {parameterOrValue}";
                }
                else if (jsonElement.ValueKind == JsonValueKind.Number)
                {
                    if (!useParam) parameterOrValue = jsonElement.GetDecimal().ToString();

                    switch (item.matchMode)
                    {
                        case "gt":
                            clause = $"{field} > {parameterOrValue}";
                            break;

                        case "lt":
                            clause = $"{field} < {parameterOrValue}";
                            break;

                        case "gte":
                            clause = $"{field} >= {parameterOrValue}";
                            break;

                        case "lte":
                            clause = $"{field} <= {parameterOrValue}";
                            break;

                        case "equals":
                            clause = $"{field} = {parameterOrValue}";
                            break;

                        case "notEquals":
                            clause = $"{field} <> {parameterOrValue}";
                            break;

                        default:
                            break;
                    }
                }
                else if (jsonElement.ValueKind == JsonValueKind.Array)
                {
                    if (!useParam) throw new NotSupportedException("Values of Array are not supported to use string format.");

                    if (jsonElement.EnumerateArray().ToList().Count > 0)
                        clause = $"{field} IN {parameterOrValue}";
                    else
                        clause = $"1=2";
                }
                else if (jsonElement.ValueKind == JsonValueKind.String)
                {
                    if (!useParam)
                    {
                        if (item.matchMode.StartsWith("date"))
                        {
                            parameterOrValue = $"TO_DATE('{_utcLocalConverter.Converter.ConvertToProvider.Invoke(jsonElement.GetDateTime()):yyyy/MM/dd HH:mm:ss}', 'YYYY/MM/DD HH24:MI:SS')";
                        }
                        else
                            parameterOrValue = $"'{jsonElement.GetString().Replace("'", "''")}'";
                    }

                    switch (item.matchMode)
                    {
                        case "startsWith":
                            clause = $"UPPER({field}) LIKE UPPER({parameterOrValue}) || '%'";
                            break;

                        case "contains":
                            clause = $"UPPER({field}) LIKE '%' || UPPER({parameterOrValue}) || '%'";
                            break;

                        case "notContains":
                            clause = $"UPPER({field}) NOT LIKE '%' || UPPER({parameterOrValue}) || '%'";
                            break;

                        case "endsWith":
                            clause = $"UPPER({field}) LIKE '%' || UPPER({parameterOrValue})";
                            break;

                        case "equals":
                            clause = $"UPPER({field}) = UPPER({parameterOrValue})";
                            break;

                        case "notEquals":
                            clause = $"UPPER({field}) <> UPPER({parameterOrValue})";
                            break;

                        case "dateIs":
                            clause = $"{field} >= {parameterOrValue} AND {field} < {parameterOrValue} + 1";
                            break;

                        case "dateIsNot":
                            clause = $"{field} < {parameterOrValue} AND {field} >= {parameterOrValue} + 1";
                            break;

                        case "dateBefore":
                            clause = $"{field} < {parameterOrValue}";
                            break;

                        case "dateAfter":
                            clause = $"{field} >= {parameterOrValue} + 1";
                            break;
                        default:
                            break;
                    }
                }
            }
            return clause;
        }

        public override string GetFilterType(DataRow schema)
        {
            var type = (Type)schema["DataType"];
            var dbType = (OracleDbType)schema["ProviderType"];
            if (dbType == OracleDbType.Boolean || (dbType == OracleDbType.Int16 && (short)schema["NumericPrecision"] == 1 && (short)schema["NumericScale"] == 0))
                type = typeof(bool);

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

        public override object TransformValue(object value, DataRow schema)
        {
            if (value == null || value == DBNull.Value) return value;

            var dbType = (OracleDbType)schema["ProviderType"];
            var type = value.GetType();

            if (dbType == OracleDbType.Boolean || (dbType == OracleDbType.Int16 && (short)schema["NumericPrecision"] == 1 && (short)schema["NumericScale"] == 0))
                return Convert.ToInt16(value) == 1;

            if (dbType == OracleDbType.Raw && (int)schema["ColumnSize"] == 16)
                return Convert.ToHexString((byte[])value);

            if (type == typeof(TimeSpan))
                return ((TimeSpan)value).TotalSeconds / 3600;

            //if (type == typeof(string) && value.ToString().Length == 32)
            //{
            //    Guid temp;
            //    if (TryParseHexToGuid((string)value, out temp))
            //    {
            //        return temp.ToString();
            //    }
            //}
            return base.TransformValue(value, schema);
        }

        //private bool TryParseHexToGuid(string text, out Guid guid)
        //{
        //    try
        //    {
        //        byte[] bytes = Convert.FromHexString(text);
        //        guid = new Guid(bytes);
        //        return true;
        //    }
        //    catch (Exception) { }

        //    guid = Guid.Empty;
        //    return false;
        //}

        protected override string EscapeColumnName(string columnName)
        {
            var cols = columnName.Split('.');
            if (cols.Length == 2)
                return string.Format("{0}.\"{1}\"", cols[0], cols[1]);
            else
                return string.Format("\"{0}\"", columnName);
        }

        public override object GenerateDynamicParameter(IEnumerable<KeyValuePair<string, object>> keyValues)
        {
            var dict = new Dictionary<string, object>();

            Func<object, object> valueConverter = null;
            valueConverter = (object value) =>
            {
                if (value != null)
                {
                    if (value.GetType().IsAssignableTo(typeof(IEnumerable<object>)))
                    {
                        return ((IEnumerable<object>)value).Select(x => valueConverter(x));
                    }
                    if (value.GetType().IsAssignableTo(typeof(IDictionary<string, object>)))
                    {
                        var dic = new Dictionary<string, object>();
                        ((IDictionary<string, object>)value).ToList().ForEach(m => dic.Add(m.Key, valueConverter(m.Value)));
                        return dic;
                    }
                    if (value.GetType() == typeof(bool))
                    {
                        return (bool)value ? 1 : 0;
                    }
                    //if (value.GetType() == typeof(string))
                    //{
                    //    Guid guid;
                    //    if (new Regex("^[0-9A-Fa-f]{8}-([0-9A-Fa-f]{4}-){3}[0-9A-Fa-f]{12}$").IsMatch(value.ToString()) && Guid.TryParse(value.ToString(), out guid))
                    //    {
                    //        return guid.ToByteArray();
                    //    }
                    //}
                }
                return value;
            };

            foreach (var item in keyValues)
            {
                var value = JsonElementConverter.GetValue(item.Value, _utcLocalConverter);
                dict.Add(ParameterName(item.Key), valueConverter(value));
            }

            dynamic param = dict.Aggregate(
                new ExpandoObject() as IDictionary<string, object>,
                (a, p) => { a.Add(p); return a; }
            );

            return (object)param;
        }

        #endregion

        #region Universal Grid

        public override string GenerateSqlTextForInsert(DataSourceConfig config)
        {
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

                var queryText = $@"INSERT INTO {source} ({columns}) VALUES ({param}) RETURNING {config.IdColumn} INTO {ParameterPrefix}{ParameterName($"RETURNED_{config.IdColumn}")}";

                return queryText;
            }
        }

        public string JoinAttachments(string query, IEnumerable<GridColConfig> attachmentCols)
        {
            var leftJoinQuery = string.Join("", attachmentCols.Select(col =>
            {
                var config = col.fileUploadConfig;
                var referenceDataKey = config.GetMappedColumn("REFERENCE_DATA_KEY");
                var foreignKey = config.GetMappedColumn("FOREIGN_KEY");

                var contentTypeCol = config.GetMappedColumn("CONTENT_TYPE");
                var contentTypeSegment = string.IsNullOrEmpty(contentTypeCol) ? "''" : EscapeColumnName(contentTypeCol);
                var commentsCol = config.GetMappedColumn("COMMENTS");
                var commentsSegment = string.IsNullOrEmpty(commentsCol) ? "''" : EscapeColumnName(commentsCol);
                var statusSegment = $"CASE WHEN {EscapeColumnName(config.GetMappedColumn("STATUS"))} = 'N' THEN '{UploadedFileStatus.Deleted}' ELSE '{UploadedFileStatus.Current}' END";

                return $@"
                LEFT JOIN (
                    SELECT 
                        {EscapeColumnName(foreignKey)},
                        JSON_ARRAYAGG(
	                        JSON_OBJECT(
		                        KEY 'fileId' VALUE {EscapeColumnName(config.GetMappedColumn("ID"))},
		                        KEY 'fileName' VALUE {EscapeColumnName(config.GetMappedColumn("FILE_NAME"))},
		                        KEY 'contentType' VALUE {contentTypeSegment},
		                        KEY 'comments' VALUE {commentsSegment},
		                        KEY 'status' VALUE {statusSegment}
		                        RETURNING CLOB
	                        ) 
	                        RETURNING CLOB
                        ) AS ATTACHMENTS
                    FROM {config.TableSchema}.{config.TableName}
                    GROUP BY {EscapeColumnName(foreignKey)}
                ) {col.field}_ATTACHMENTS ON ALL_DATA.{EscapeColumnName(referenceDataKey)} = {col.field}_ATTACHMENTS.{EscapeColumnName(foreignKey)}
                ";
            }));

            var selectQuery = string.Join(",", attachmentCols.Select(col => $"{col.field}_ATTACHMENTS.ATTACHMENTS AS {EscapeColumnName(col.field)}"));

            var queryWithoutOrderby = RemoveOrderBy(query, out var orderByQuery);

            var result = $@"
                SELECT ALL_DATA.*, {selectQuery} FROM (
                    {queryWithoutOrderby}
                ) ALL_DATA
                {leftJoinQuery}
                {orderByQuery}
            ";
            return result;
        }

        #endregion

        #region Database 

        /// <summary>
        /// Sql to get all tables from database, the first column should be table name and second column should be table schema.
        /// </summary>
        /// <returns></returns>
        public string GetSqlTextForDatabaseTables(bool useSchemaRule, bool useTableNameRule)
        {
            var sql = $@"
                SELECT * FROM 
                (
                    SELECT TABLE_NAME AS TableName, OWNER AS TableSchema FROM all_tables
                    UNION
                    SELECT VIEW_NAME AS TableName, OWNER AS TableSchema FROM all_views
                )
                WHERE TableName != '__EFMigrationsHistory'
            ";

            if (useSchemaRule)
                sql += $" AND TableSchema IN {ParameterPrefix}{ParameterName("SCHEMAS")}";
            if (useTableNameRule)
                sql += $" AND REGEXP_LIKE(TableName, {ParameterPrefix}{ParameterName("TABLE_NAME_RULE")})";

            return sql;
        }

        public string GetSqlTextForDatabaseSource(DataSourceConfig config)
        {
            if (!string.IsNullOrEmpty(config.QueryText))
            {
                var sqlText = GenerateSqlTextForList(config);
                sqlText = UseSearches(sqlText);
                sqlText = UseFilters(sqlText);
                sqlText = RemoveOrderBy(sqlText, out var _);

                return $"SELECT * FROM ({sqlText}) A WHERE rownum = 1";
            }
            else
            {
                var source = string.IsNullOrEmpty(config.TableName) ? config.TableName : $"{config.TableSchema}.{config.TableName}";

                return $"SELECT * FROM {source} WHERE rownum = 1";
            }
        }

        #endregion
    }
}
