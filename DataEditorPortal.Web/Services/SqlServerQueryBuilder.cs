using DataEditorPortal.Web.Models.UniversalGrid;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace DataEditorPortal.Web.Services
{
    public class SqlServerQueryBuilder : QueryBuilder, IQueryBuilder
    {
        protected override string ParameterPrefix => "@";

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
                    clause = $"{field} IN {parameter}";
                }
                else if (jsonElement.ValueKind == JsonValueKind.String)
                {
                    switch (item.matchMode)
                    {
                        case "startsWith":
                            clause = $"{field} LIKE {parameter} + '%'";
                            break;

                        case "contains":
                            clause = $"{field} LIKE '%' + {parameter} + '%'";
                            break;

                        case "notContains":
                            clause = $"{field} NOT LIKE '%' + {parameter} + '%'";
                            break;

                        case "endsWith":
                            clause = $"{field} LIKE '%' + {parameter}";
                            break;

                        case "equals":
                            clause = $"{field} = {parameter}";
                            break;

                        case "notEquals":
                            clause = $"{field} <> {parameter}";
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

        protected override string EscapeColumnName(string columnName)
        {
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
                return $@"
                LEFT JOIN (
                    SELECT 
                        {EscapeColumnName(config.GetMappedColumn("DATA_ID"))},
                        '[' +
                            STUFF(
                                (SELECT 
                                    ',{{' +
                                        '""fileId"":""' + {EscapeColumnName(config.GetMappedColumn("ID"))} + '"",' +
                                        '""fileName"":""' + {EscapeColumnName(config.GetMappedColumn("FILE_NAME"))} + '"",' +
                                        '""contentType"":""' + {EscapeColumnName(config.GetMappedColumn("CONTENT_TYPE"))} + '"",' +
                                        '""comments"":""' + {EscapeColumnName(config.GetMappedColumn("COMMENTS"))} + '"",' +
                                        '""status"":""' + {EscapeColumnName(config.GetMappedColumn("STATUS"))} + '""' +
                                    '}}' 
                                FROM {config.TableSchema}.{config.TableName} FOR XML PATH (''))
                                , 1, 1, ''
                            ) + 
                        ']' AS ATTACHMENTS
                    FROM {config.TableSchema}.{config.TableName}
                    GROUP BY {EscapeColumnName(config.GetMappedColumn("DATA_ID"))}
                ) {col.field}_ATTACHMENTS ON ALL_DATA.{EscapeColumnName(config.ForeignKeyName)} = {col.field}_ATTACHMENTS.{EscapeColumnName(config.GetMappedColumn("DATA_ID"))}
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

        public string GetSqlTextForDatabaseTables()
        {
            return $"SELECT TABLE_NAME AS TableName, TABLE_SCHEMA AS TableSchema FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME != '__EFMigrationsHistory' AND TABLE_TYPE = 'BASE TABLE'";
        }

        public string GetSqlTextForDatabaseSource(DataSourceConfig config)
        {
            if (!string.IsNullOrEmpty(config.QueryText))
            {
                var sqlText = GenerateSqlTextForList(config);
                sqlText = UseSearches(sqlText);
                sqlText = UseFilters(sqlText);
                sqlText = RemoveOrderBy(sqlText);

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
