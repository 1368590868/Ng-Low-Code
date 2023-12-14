using DataEditorPortal.Data.Common;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

namespace System.Text.Json
{
    public static class JsonElementConverter
    {
        public static object GetValue(object value, IUtcLocalConverter _utcLocalConverter = null)
        {
            if (value is byte[]) return value;

            JsonElement jsonElement;
            if (value is JsonElement) jsonElement = (JsonElement)value;
            else jsonElement = JsonSerializer.Deserialize<JsonElement>(JsonSerializer.Serialize(value));

            if (jsonElement.ValueKind == JsonValueKind.Array)
            {
                return jsonElement.EnumerateArray().Select(m => GetValue(m, _utcLocalConverter)).ToList();
            }
            else if (jsonElement.ValueKind == JsonValueKind.Object)
            {
                var dic = new Dictionary<string, object>();
                jsonElement.EnumerateObject().ToList().ForEach(m => dic.Add(m.Name, GetValue(m.Value, _utcLocalConverter)));
                return dic;
            }
            else if (jsonElement.ValueKind == JsonValueKind.Number) return jsonElement.GetDecimal();
            else if (jsonElement.ValueKind == JsonValueKind.True) return true;
            else if (jsonElement.ValueKind == JsonValueKind.False) return false;
            else if (jsonElement.ValueKind == JsonValueKind.String)
            {
                if (Regex.IsMatch(jsonElement.GetString(), @"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$"))
                {
                    var formats = new string[] { "yyyy-MM-ddTHH:mm:ss.FFFFFFFK", "", "" };
                    DateTime date;
                    if (DateTime.TryParseExact(jsonElement.GetString(), formats, null, System.Globalization.DateTimeStyles.None, out date))
                    {
                        return _utcLocalConverter != null ? _utcLocalConverter.Converter.ConvertToProvider.Invoke(date) : date;
                    }
                }
                return jsonElement.GetString();
            }
            else return null;
        }
    }
}
