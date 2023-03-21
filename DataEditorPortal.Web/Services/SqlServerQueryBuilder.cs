using DataEditorPortal.Web.Models.UniversalGrid;
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
