using DataEditorPortal.Web.Models.UniversalGrid;
using System;
using System.Data;
using System.Linq;
using System.Text.Json;

namespace DataEditorPortal.Web.Services
{
    public class SqlServerQueryBuilder : QueryBuilder, IQueryBuilder
    {
        #region Ultilities

        protected override string GenerateCriteriaClause(FilterParam item, string whereClause = null)
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
                            if (!string.IsNullOrEmpty(value.GetString()))
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

        public override Type GetValueType(DataRow schema)
        {
            var sqlDbType = (SqlDbType)schema["ProviderType"];
            if (sqlDbType == SqlDbType.Date) return typeof(DateTime);
            if (sqlDbType == SqlDbType.DateTime || sqlDbType == SqlDbType.DateTime2 || sqlDbType == SqlDbType.SmallDateTime)
                return typeof(DateTime);
            if (sqlDbType == SqlDbType.Float || sqlDbType == SqlDbType.Decimal || sqlDbType == SqlDbType.Money)
                return typeof(decimal);
            if (sqlDbType == SqlDbType.Bit)
                return typeof(bool);
            else
                return typeof(string);
        }


        protected override string EscapeColumnName(string columnName)
        {
            return string.Format("[{0}]", columnName);
        }

        protected override string ParameterName(string name)
        {
            return string.Format("@{0}", name);
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

                return $"SELECT TOP 1 * FROM ({sqlText}) AS A";
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
