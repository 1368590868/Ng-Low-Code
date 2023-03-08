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
            var fieldRegex = new Regex(@"\#\#([a-zA-Z]+[a-zA-Z0-9]+)\#\#");
            var regex = new Regex(@"\{\{(.+)\}\}");
            var optionalCriterias = regex.Matches(queryText);

            var keyValuePairs = new List<KeyValuePair<string, object>>();

            // process optional criterias
            foreach (Match match in optionalCriterias)
            {
                // check the value in model.
                var fieldMatch = fieldRegex.Match(match.Value);
                var key = fieldMatch.Groups[1].Value;

                object value = null;
                if (model.ContainsKey(key))
                    value = GetJsonElementValue(model[key]);

                if (value == null)
                {
                    // do not have value passed in for this field. 
                    // then we dont need to apply this criteria, replace it with empty.
                    queryText = queryText.Replace(match.Value, "");
                }
                else
                {
                    if (new Regex(@$"IN {fieldMatch.Value.ToUpper()}").IsMatch(match.Value.ToUpper()) && !(value is IEnumerable<object>))
                    {
                        // check the operator, if it is "IN", but value is not IEnumerable<object>
                        // we dont need to apply this criteria, replace it with empty.
                        queryText = queryText.Replace(match.Value, "");
                    }
                    else
                    {
                        keyValuePairs.Add(new KeyValuePair<string, object>(key, value));

                        var criteria = match.Groups[1].Value.Replace(fieldMatch.Value, $"@{key}");
                        queryText = queryText.Replace(match.Value, criteria);
                    }

                }
            }

            // process required criterias
            var matches = fieldRegex.Matches(queryText);
            foreach (Match match in matches)
            {
                var key = match.Groups[1].Value;

                object value = null;
                if (model.ContainsKey(key))
                    value = GetJsonElementValue(model[key]);

                if (new Regex(@$"IN {match.Value.ToUpper()}").IsMatch(queryText.ToUpper()))
                {
                    // check the operator, if it is "IN", value should be IEnumerable<object>
                    // If not, we need to default the value to empty array.
                    if (value != null && value is IEnumerable<object>)
                        keyValuePairs.Add(new KeyValuePair<string, object>(key, value));
                    else
                        keyValuePairs.Add(new KeyValuePair<string, object>(key, new object[] { }));
                }
                else
                {
                    if (value != null) keyValuePairs.Add(new KeyValuePair<string, object>(key, value));
                    else keyValuePairs.Add(new KeyValuePair<string, object>(key, null));
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
