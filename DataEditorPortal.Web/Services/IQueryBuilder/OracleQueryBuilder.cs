using DataEditorPortal.Data.Common;
using DataEditorPortal.Web.Models.UniversalGrid;
using Oracle.ManagedDataAccess.Client;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace DataEditorPortal.Web.Services
{
    public class OracleQueryBuilder : QueryBuilder, IQueryBuilder
    {
        protected override string ParameterPrefix => ":";

        #region Ultilities

        protected override string GenerateCriteriaClause(FilterParam item)
        {
            string field = EscapeColumnName(item.field);
            string parameter = $"{ParameterPrefix}{ParameterName(item.field)}_{item.index}";

            string clause = string.Empty;
            if (!string.IsNullOrEmpty(item.whereClause))
            {
                clause = item.whereClause.Replace("##VALUE##", parameter);
            }
            else
            {
                var jsonElement = JsonSerializer.Deserialize<JsonElement>(JsonSerializer.Serialize(item.value));

                if (jsonElement.ValueKind == JsonValueKind.True || jsonElement.ValueKind == JsonValueKind.False)
                {
                    clause = $"{field} = {parameter}";
                }
                else if (jsonElement.ValueKind == JsonValueKind.Number)
                {
                    switch (item.matchMode)
                    {
                        case "gt":
                            clause = $"{field} > {parameter}";
                            break;

                        case "lt":
                            clause = $"{field} < {parameter}";
                            break;

                        case "gte":
                            clause = $"{field} >= {parameter}";
                            break;

                        case "lte":
                            clause = $"{field} <= {parameter}";
                            break;

                        case "equals":
                            clause = $"{field} = {parameter}";
                            break;

                        case "notEquals":
                            clause = $"{field} <> {parameter}";
                            break;

                        default:
                            break;
                    }
                }
                else if (jsonElement.ValueKind == JsonValueKind.Array)
                {
                    if (jsonElement.EnumerateArray().ToList().Count > 0)
                        clause = $"{field} IN {parameter}";
                }
                else if (jsonElement.ValueKind == JsonValueKind.String)
                {
                    switch (item.matchMode)
                    {
                        case "startsWith":
                            clause = $"UPPER({field}) LIKE UPPER({parameter}) || '%'";
                            break;

                        case "contains":
                            clause = $"UPPER({field}) LIKE '%' || UPPER({parameter}) || '%'";
                            break;

                        case "notContains":
                            clause = $"UPPER({field}) NOT LIKE '%' || UPPER({parameter}) || '%'";
                            break;

                        case "endsWith":
                            clause = $"UPPER({field}) LIKE '%' || UPPER({parameter})";
                            break;

                        case "equals":
                            clause = $"UPPER({field}) = UPPER({parameter})";
                            break;

                        case "notEquals":
                            clause = $"UPPER({field}) <> UPPER({parameter})";
                            break;

                        case "dateIs":
                            clause = $"{field} = {parameter}";
                            break;

                        case "dateIsNot":
                            clause = $"{field} <> {parameter}";
                            break;

                        case "dateBefore":
                            clause = $"{field} < {parameter}";
                            break;

                        case "dateAfter":
                            clause = $"{field} > {parameter}";
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
                return new Guid((byte[])value);

            if (type == typeof(TimeSpan))
                return ((TimeSpan)value).TotalSeconds / 3600;

            if (type == typeof(string) && value.ToString().Length == 32)
            {
                Guid temp;
                if (TryParseHexToGuid((string)value, out temp))
                {
                    return temp.ToString();
                }
            }
            return value;
        }

        private bool TryParseHexToGuid(string text, out Guid guid)
        {
            try
            {
                byte[] bytes = Convert.FromHexString(text);
                guid = new Guid(bytes);
                return true;
            }
            catch (Exception) { }

            guid = Guid.Empty;
            return false;
        }

        protected override string EscapeColumnName(string columnName)
        {
            var cols = columnName.Split('.');
            if (cols.Length == 2)
                return string.Format("{0}.\"{1}\"", cols[0], cols[1]);
            else
                return string.Format("\"{0}\"", columnName);
        }

        public override object GetJsonElementValue(object value)
        {
            var result = base.GetJsonElementValue(value);

            if (result != null && result.GetType() == typeof(string))
            {
                Guid guid;
                if (new Regex("^[0-9A-Fa-f]{8}-([0-9A-Fa-f]{4}-){3}[0-9A-Fa-f]{12}$").IsMatch(result.ToString()) && Guid.TryParse(result.ToString(), out guid))
                {
                    return guid.ToByteArray();
                }
            }

            return result;
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
                var statusSegment = $"CASE WHEN {EscapeColumnName(config.GetMappedColumn("STATUS"))} = 0 THEN '{UploadedFileStatus.Current}' ELSE '{UploadedFileStatus.Deleted}' END";

                return $@"
                LEFT JOIN (
                    SELECT 
                        {EscapeColumnName(foreignKey)},
                        '[' || 
                            REPLACE(
                                LISTAGG(
                                    '{{' || 
                                        '""fileId"":""' || {EscapeColumnName(config.GetMappedColumn("ID"))} || '"",' || 
                                        '""fileName"":""' || {EscapeColumnName(config.GetMappedColumn("FILE_NAME"))} || '"",' || 
                                        '""contentType"":""' || {contentTypeSegment} || '"",' || 
                                        '""comments"":""' || {commentsSegment} || '"",' || 
                                        '""status"":""' || {statusSegment} || '""' ||
                                    '}}'
                                    , ','
                                ) WITHIN GROUP (ORDER BY { EscapeColumnName(config.GetMappedColumn("FILE_NAME"))})
                                , CHR(0)
                            ) || 
                        ']' AS ATTACHMENTS
                    FROM {config.TableSchema}.{config.TableName}
                    GROUP BY {EscapeColumnName(foreignKey)}
                ) {col.field}_ATTACHMENTS ON ALL_DATA.{EscapeColumnName(referenceDataKey)} = {col.field}_ATTACHMENTS.{EscapeColumnName(foreignKey)}
                ";
            }));

            var selectQuery = string.Join(",", attachmentCols.Select(col => $"{col.field}_ATTACHMENTS.ATTACHMENTS AS {EscapeColumnName(col.field)}"));

            var result = $@"
                SELECT ALL_DATA.*, {selectQuery} FROM (
                    {query}
                ) ALL_DATA
                {leftJoinQuery}
            ";
            return result;
        }

        #endregion

        #region Database 

        /// <summary>
        /// Sql to get all tables from database, the first column should be table name and second column should be table schema.
        /// </summary>
        /// <returns></returns>
        public string GetSqlTextForDatabaseTables()
        {
            return $"SELECT TABLE_NAME AS TableName, OWNER AS TableSchema FROM all_tables WHERE TABLE_NAME IN (SELECT TABLE_NAME FROM user_tables WHERE TABLE_NAME <> '__EFMigrationsHistory')";
        }

        public string GetSqlTextForDatabaseSource(DataSourceConfig config)
        {
            if (!string.IsNullOrEmpty(config.QueryText))
            {
                var sqlText = GenerateSqlTextForList(config);
                sqlText = UseSearches(sqlText);
                sqlText = UseFilters(sqlText);
                sqlText = RemoveOrderBy(sqlText);

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
