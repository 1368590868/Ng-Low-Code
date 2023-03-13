using DataEditorPortal.Web.Models.UniversalGrid;
using Oracle.ManagedDataAccess.Client;
using System;
using System.Data;
using System.Linq;
using System.Text.Json;

namespace DataEditorPortal.Web.Services
{
    public class OracleQueryBuilder : QueryBuilder, IQueryBuilder
    {
        protected override string ParameterPrefix => ":";

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
                    result = $"\"{field}\" = {(value ? 1 : 0)}";
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
                            result = $"\"{field}\" > {value}";
                            break;

                        case "lt":
                            result = $"\"{field}\" < {value}";
                            break;

                        case "gte":
                            result = $"\"{field}\" >= {value}";
                            break;

                        case "lte":
                            result = $"\"{field}\" <= {value}";
                            break;

                        case "equals":
                            result = $"\"{field}\" = {value}";
                            break;

                        case "notEquals":
                            result = $"\"{field}\" <> {value}";
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
                        result = $"\"{field}\" IN ({inStr.Substring(1)})";
                }
            }
            else if (jsonElement.ValueKind == JsonValueKind.String)
            {
                var value = jsonElement.GetString().Replace("'", "''");
                if (whereClause != null)
                    result = whereClause.Replace("##VALUE##", value.ToString());
                else
                {
                    value = value.ToUpper();
                    switch (item.matchMode)
                    {
                        case "startsWith":
                            result = $"UPPER(\"{field}\") like '{value}%'";
                            break;

                        case "contains":
                            result = $"UPPER(\"{field}\") like '%{value}%'";
                            break;

                        case "notContains":
                            result = $"UPPER(\"{field}\") not like '%{value}%'";
                            break;

                        case "endsWith":
                            result = $"UPPER(\"{field}\") like '%{value}'";
                            break;

                        case "equals":
                            result = $"UPPER(\"{field}\") = '{value}'";
                            break;

                        case "notEquals":
                            result = $"UPPER(\"{field}\") <> '{value}'";
                            break;

                        case "dateIs":
                            result = $"\"{field}\" = TO_DATE('{jsonElement.GetDateTime():yyyy/MM/dd}','yyyy/mm/dd')";
                            break;

                        case "dateIsNot":
                            result = $"\"{field}\" <> TO_DATE('{jsonElement.GetDateTime():yyyy/MM/dd}','yyyy/mm/dd')";
                            break;

                        case "dateBefore":
                            result = $"\"{field}\" < TO_DATE('{jsonElement.GetDateTime():yyyy/MM/dd}','yyyy/mm/dd')";
                            break;

                        case "dateAfter":
                            result = $"\"{field}\" > TO_DATE('{jsonElement.GetDateTime():yyyy/MM/dd}','yyyy/mm/dd')";
                            break;
                        default:
                            break;
                    }
                }
            }

            return result;
        }

        public override Type GetValueType(DataRow schema)
        {
            var dbType = (OracleDbType)schema["ProviderType"];
            if (dbType == OracleDbType.Date || dbType == OracleDbType.TimeStamp || dbType == OracleDbType.TimeStampLTZ || dbType == OracleDbType.TimeStampTZ)
                return typeof(DateTime);

            if (dbType == OracleDbType.IntervalYM)
                return typeof(int);

            if (dbType == OracleDbType.IntervalDS)
                return typeof(double);

            if (dbType == OracleDbType.Boolean || (dbType == OracleDbType.Int16 && (short)schema["NumericPrecision"] == 1 && (short)schema["NumericScale"] == 0))
                return typeof(bool);

            if (dbType == OracleDbType.Raw && (int)schema["ColumnSize"] == 16)
                return typeof(Guid);

            if (dbType == OracleDbType.Int16 || dbType == OracleDbType.Int32 || dbType == OracleDbType.Int64 ||
                dbType == OracleDbType.Decimal || dbType == OracleDbType.BinaryFloat || dbType == OracleDbType.Double ||
                dbType == OracleDbType.BinaryDouble)
                return typeof(decimal);

            return typeof(string);
        }

        protected override string EscapeColumnName(string columnName)
        {
            return string.Format("\"{0}\"", columnName);
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
