using DataEditorPortal.Data.Common;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Models.UniversalGrid;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace DataEditorPortal.Web.Services
{
    public interface IDataUpdateHistoryService
    {
        List<DataUpdateHistory> CompareAndApply(IEnumerable<FormFieldConfig> fields, IDictionary<string, object> model, IDictionary<string, object> modelToUpdate);
        List<DataUpdateHistoryModel> GetDataUpdateHistories(string configId, string id);
    }

    public class DataUpdateHistoryService : IDataUpdateHistoryService
    {
        private readonly DepDbContext _depDbContext;
        private readonly ILogger<DataUpdateHistoryService> _logger;
        private readonly ICurrentUserAccessor _currentUserAccessor;
        private readonly IUtcLocalConverter _utcLocalConverter;
        private readonly string dateFormat = "yyyy-MM-dd HH:mm:ss";
        private readonly IValueProcessorFactory _valueProcessorFactory;

        public DataUpdateHistoryService(
            DepDbContext depDbContext,
            ILogger<DataUpdateHistoryService> logger,
            ICurrentUserAccessor currentUserAccessor,
            IQueryBuilder queryBuilder,
            IUtcLocalConverter utcLocalConverter,
            IValueProcessorFactory valueProcessorFactory)
        {
            _depDbContext = depDbContext;
            _logger = logger;
            _currentUserAccessor = currentUserAccessor;
            _utcLocalConverter = utcLocalConverter;
            _valueProcessorFactory = valueProcessorFactory;
        }

        public List<DataUpdateHistory> CompareAndApply(IEnumerable<FormFieldConfig> fields, IDictionary<string, object> model, IDictionary<string, object> modelToUpdate)
        {
            var updateHistories = new List<DataUpdateHistory>();
            var updateTime = DateTime.UtcNow;

            foreach (FormFieldConfig field in fields)
            {
                if (model.ContainsKey(field.key))
                {
                    // original value should query from db, it should be correct type already. 
                    // new value should from frontend, it should be JsonElement
                    // no matter where the value come from,
                    // invoke JsonElementConverter.GetValue() to get the correct value with type that can be write to db
                    var originalValue = JsonElementConverter.GetValue(modelToUpdate[field.key], _utcLocalConverter);
                    var newValue = JsonElementConverter.GetValue(model[field.key], _utcLocalConverter);

                    var comparer = _valueProcessorFactory.CreateValueComparer(field, null);
                    if (comparer != null)
                    {
                        if (!comparer.Equals(originalValue, newValue))
                        {
                            modelToUpdate[field.key] = newValue;
                            // generate data update history, store json
                            updateHistories.Add(new DataUpdateHistory()
                            {
                                Username = _currentUserAccessor.CurrentUser.Username(),
                                CreateDate = updateTime,
                                Field = field.key,
                                OriginalValue = comparer.GetValueString(originalValue),
                                NewValue = comparer.GetValueString(newValue),
                                ValueType = typeof(string).ToString(),
                                ActionType = ActionType.Update,
                                FieldConfig = JsonSerializer.Serialize(new { field.type, field.filterType })
                            });
                        }
                    }
                    else
                    {
                        if (!IsValueEqual(originalValue, newValue))
                        {
                            modelToUpdate[field.key] = newValue;
                            // generate data update history, store json
                            updateHistories.Add(new DataUpdateHistory()
                            {
                                Username = _currentUserAccessor.CurrentUser.Username(),
                                CreateDate = updateTime,
                                Field = field.key,
                                OriginalValue = ConvertValueToString(originalValue),
                                NewValue = ConvertValueToString(newValue),
                                ValueType = GetValueTypeString(originalValue, newValue),
                                ActionType = ActionType.Update,
                                FieldConfig = JsonSerializer.Serialize(new { field.type, field.filterType })
                            });
                        }
                    }
                }
            }

            return updateHistories;
        }

        public List<DataUpdateHistoryModel> GetDataUpdateHistories(string configId, string id)
        {
            var list = _depDbContext.DataUpdateHistories
                .Where(h => h.GridConfigurationId == configId && h.DataId == id)
                .OrderByDescending(h => h.CreateDate)
                .ToList();

            var result = new List<DataUpdateHistoryModel>();
            foreach (var item in list)
            {
                var model = new DataUpdateHistoryModel()
                {
                    Id = item.Id,
                    CreateDate = item.CreateDate,
                    Username = item.Username,
                    DataId = item.DataId,
                    Field = item.Field,
                    OriginalValue = ConvertStringToValue(item.OriginalValue, item.ValueType),
                    NewValue = ConvertStringToValue(item.NewValue, item.ValueType),
                    ActionType = item.ActionType,
                    FieldConfig = JsonSerializer.Deserialize<Dictionary<string, object>>(item.FieldConfig)
                };
                result.Add(model);
            }
            return result;
        }

        /// <summary>
        /// Convert value to string based on the result of GetJsonElementValue
        /// </summary>
        /// <param name="value">Value should be the result of GetJsonElementValue</param>
        /// <returns></returns>
        private string ConvertValueToString(object value)
        {
            if (value == null) return "";

            var type = value.GetType();
            if (type == typeof(DateTime)) { return ((DateTime)value).ToString(dateFormat); }
            if (type == typeof(byte[])) { return Convert.ToBase64String((byte[])value); }
            if (type == typeof(string)) { return value.ToString(); }

            return JsonSerializer.Serialize(value);
        }

        private object ConvertStringToValue(string valueStr, string typeStr)
        {
            if (string.IsNullOrEmpty(typeStr)) { return valueStr; }

            var type = Type.GetType(typeStr);
            if (type == null) { return valueStr; };
            if (type == typeof(decimal)) return decimal.Parse(valueStr);
            if (type == typeof(DateTime))
            {
                var formats = new string[] { dateFormat, "", "" };
                DateTime date;
                if (DateTime.TryParseExact(valueStr, formats, null, System.Globalization.DateTimeStyles.None, out date))
                {
                    return _utcLocalConverter.Converter.ConvertFromProvider.Invoke(date);
                }
            }
            if (type == typeof(byte[])) { return Convert.FromBase64String(typeStr); }
            if (type == typeof(bool)) { return Convert.ToBoolean(valueStr); }
            if (type == typeof(string)) { return valueStr; }

            return JsonSerializer.Deserialize(valueStr, type);
        }

        /// <summary>
        /// Get the type string, value1 and value2 should not be both null.
        /// </summary>
        /// <param name="value1"></param>
        /// <param name="value2"></param>
        /// <returns></returns>
        private string GetValueTypeString(object value1, object value2)
        {
            var value = value1 == null ? value2 : value1;

            if (value == null) return "";
            var type = value.GetType();
            if (type == typeof(int))
            {
                var temp = (int)value;
                if (temp == 0 || temp == 1) return typeof(bool).ToString();
            }
            return type.ToString();
        }

        private bool IsValueEqual(object x, object y)
        {
            if (ReferenceEquals(x, y))
                return true;

            if (x == null && y == null)
                return false;

            if (x != null && y != null)
            {
                Type typeX = x.GetType();
                Type typeY = y.GetType();

                if (typeX != typeY)
                    return false;

                if (typeX == typeof(DateTime))
                {
                    return ((DateTime)x).ToString(dateFormat) == ((DateTime)y).ToString(dateFormat);
                }

                return x.Equals(y);
            }

            return false;
        }
    }
}
