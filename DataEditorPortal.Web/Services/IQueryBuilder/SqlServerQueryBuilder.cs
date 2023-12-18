using DataEditorPortal.Data.Common;
using DataEditorPortal.Web.Models.UniversalGrid;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace DataEditorPortal.Web.Services
{
    public class SqlServerQueryBuilder : QueryBuilder, IQueryBuilder
    {
        public SqlServerQueryBuilder(IUtcLocalConverter dateTimeValueConverter) : base(dateTimeValueConverter) { }

        protected override string ParameterPrefix => "@";

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
                            parameterOrValue = $"'{_utcLocalConverter.Converter.ConvertToProvider.Invoke(jsonElement.GetDateTime()):yyyy/MM/dd HH:mm:ss}'";
                        }
                        else
                            parameterOrValue = $"'{jsonElement.GetString().Replace("'", "''")}'";
                    }

                    switch (item.matchMode)
                    {
                        case "startsWith":
                            clause = $"{field} LIKE {parameterOrValue} + '%'";
                            break;

                        case "contains":
                            clause = $"{field} LIKE '%' + {parameterOrValue} + '%'";
                            break;

                        case "notContains":
                            clause = $"{field} NOT LIKE '%' + {parameterOrValue} + '%'";
                            break;

                        case "endsWith":
                            clause = $"{field} LIKE '%' + {parameterOrValue}";
                            break;

                        case "equals":
                            clause = $"{field} = {parameterOrValue}";
                            break;

                        case "notEquals":
                            clause = $"{field} <> {parameterOrValue}";
                            break;

                        case "dateIs":
                            clause = $"{field} >= {parameterOrValue} AND {field} < DATEADD(DAY, 1, {parameterOrValue})";
                            break;

                        case "dateIsNot":
                            clause = $"{field} < {parameterOrValue} AND {field} >= DATEADD(DAY, 1, {parameterOrValue})";
                            break;

                        case "dateBefore":
                            clause = $"{field} < {parameterOrValue}";
                            break;

                        case "dateAfter":
                            clause = $"{field} >= DATEADD(DAY, 1, {parameterOrValue})";
                            break;
                        default:
                            break;
                    }
                }
            }

            return clause;
        }

        protected override string EscapeColumnName(string columnName)
        {
            var cols = columnName.Split('.');
            if (cols.Length == 2)
                return string.Format("{0}.[{1}]", cols[0], cols[1]);
            else
                return string.Format("[{0}]", columnName);
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

                var queryText = $@"
                    DECLARE @InsertedIDResults TABLE (ID NVARCHAR(40)); 
                    INSERT INTO {source} ({columns}) OUTPUT INSERTED.{config.IdColumn} INTO @InsertedIDResults VALUES ({param});
                    SET {ParameterPrefix}{ParameterName($"RETURNED_{config.IdColumn}")} = (SELECT TOP 1 ID FROM @InsertedIDResults);
                ";

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
                var contentTypeSegment = string.IsNullOrEmpty(contentTypeCol) ? "''" : $"ISNULL({EscapeColumnName(contentTypeCol)}, '')";
                var commentsCol = config.GetMappedColumn("COMMENTS");
                var commentsSegment = string.IsNullOrEmpty(commentsCol) ? "''" : $"ISNULL({EscapeColumnName(commentsCol)}, '')";
                var statusSegment = $"CASE WHEN {EscapeColumnName(config.GetMappedColumn("STATUS"))} = 'N' THEN '{UploadedFileStatus.Deleted}' ELSE '{UploadedFileStatus.Current}' END";

                return $@"
                LEFT JOIN (
                    SELECT 
                        {EscapeColumnName(foreignKey)},
                        '[' +
                            STUFF(
                                (SELECT 
                                    ',{{' +
                                        '""fileId"":""' + {EscapeColumnName(config.GetMappedColumn("ID"))} + '"",' +
                                        '""fileName"":""' + STRING_ESCAPE({EscapeColumnName(config.GetMappedColumn("FILE_NAME"))}, 'json') + '"",' +
                                        '""contentType"":""' + STRING_ESCAPE({contentTypeSegment}, 'json') + '"",' +
                                        '""comments"":""' + STRING_ESCAPE({commentsSegment}, 'json') + '"",' +
                                        '""status"":""' + {statusSegment} + '""' +
                                    '}}' 
                                FROM {config.TableSchema}.{config.TableName} WHERE {EscapeColumnName(foreignKey)} = A.{EscapeColumnName(foreignKey)} FOR XML PATH (''))
                                , 1, 1, ''
                            ) + 
                        ']' AS ATTACHMENTS
                    FROM {config.TableSchema}.{config.TableName} A
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

        public string GetSqlTextForDatabaseTables(bool useSchemaRule, bool useTableNameRule)
        {
            var sql = $@"
                SELECT * FROM 
                (
                    SELECT TABLE_NAME AS TableName, TABLE_SCHEMA AS TableSchema FROM INFORMATION_SCHEMA.TABLES
                    WHERE TABLE_TYPE = 'BASE TABLE'
                    UNION
                    SELECT TABLE_NAME AS TableName, TABLE_SCHEMA AS TableSchema FROM INFORMATION_SCHEMA.VIEWS
                ) A
                WHERE TableName != '__EFMigrationsHistory'
            ";

            if (useSchemaRule)
                sql += $" AND TableSchema IN {ParameterPrefix}{ParameterName("SCHEMAS")}";
            if (useTableNameRule)
                sql += $" AND TableName LIKE {ParameterPrefix}{ParameterName("TABLE_NAME_RULE")}";

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

                return $"SELECT TOP 1 * FROM ({sqlText}) A";
            }
            else
            {
                var source = string.IsNullOrEmpty(config.TableName) ? config.TableName : $"{config.TableSchema}.{config.TableName}";

                return $"SELECT TOP 1 * FROM {source}";
            }
        }

        #endregion
    }
}
