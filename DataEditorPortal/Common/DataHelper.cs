using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace DataEditorPortal.Web.Common
{
    public static class DataHelper
    {
        public static (string, List<KeyValuePair<string, object>>) ProcessQueryWithParamters(string queryText, Dictionary<string, JsonElement> model)
        {
            var regex = new Regex(@"\#\#([a-zA-Z]+[a-zA-Z0-9]+)\#\#");
            var matches = regex.Matches(queryText);

            var keyValuePairs = new List<KeyValuePair<string, object>>();

            foreach (Match match in matches)
            {
                var key = match.Groups[1].Value;

                if (model.ContainsKey(key))
                {
                    var value = GetJsonElementValue(model[key]);
                    keyValuePairs.Add(new KeyValuePair<string, object>(key, value));
                }
                else
                {
                    keyValuePairs.Add(new KeyValuePair<string, object>(key, null));
                }
                queryText = queryText.Replace(match.Value, $"@{key}");
            }

            return (queryText, keyValuePairs);
        }

        public static object GetJsonElementValue(JsonElement jsonElement)
        {
            object value = null;
            if (jsonElement.ValueKind == JsonValueKind.Array)
            {
                value = jsonElement.EnumerateArray().Select(m => GetJsonElementValue(m)).ToList();
            }
            else if (jsonElement.ValueKind == JsonValueKind.Object)
            {
                value = jsonElement.EnumerateObject().Select(m => GetJsonElementValue(m.Value)).ToList();
            }
            else if (jsonElement.ValueKind == JsonValueKind.Number) value = jsonElement.GetDecimal();
            else if (jsonElement.ValueKind == JsonValueKind.True || jsonElement.ValueKind == JsonValueKind.False) value = jsonElement.GetBoolean();
            else if (jsonElement.ValueKind == JsonValueKind.String) value = jsonElement.GetString();
            else value = null;
            return value;
        }
    }
}
