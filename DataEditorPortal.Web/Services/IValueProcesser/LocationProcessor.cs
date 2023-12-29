using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace DataEditorPortal.Web.Services
{
    [FilterType("locationField")]
    public class LocationProcessor : ValueProcessorBase
    {
        private readonly IServiceProvider _serviceProvider;

        public LocationProcessor(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public override void PreProcess(IDictionary<string, object> model)
        {
            ProcessLocationField(model);
        }

        public override void PostProcess(IDictionary<string, object> model)
        {
            return;
        }

        public override void FetchValue(IDictionary<string, object> model)
        {
            if (Field.props == null) return;

            using (JsonDocument doc = JsonDocument.Parse(Field.props.ToString()))
            {
                var props = doc.RootElement.EnumerateObject();

                var mappingProp = props.FirstOrDefault(x => x.Name == "mappingColumns").Value;
                if (mappingProp.ValueKind == JsonValueKind.Object)
                {
                    // only get the mappings that already configed.
                    var mappings = mappingProp.EnumerateObject().Where(m => m.Value.GetString() != null);

                    var valueModel = new Dictionary<string, object>();
                    foreach (var mapping in mappings)
                    {
                        var key = mapping.Value.GetString();
                        if (model.ContainsKey(key))
                            valueModel.Add(mapping.Name, model[key]);
                    }

                    if (model.ContainsKey(Field.key))
                        model[Field.key] = valueModel;
                    else
                        model.Add(Field.key, valueModel);
                }
            }
        }

        private void ProcessLocationField(IDictionary<string, object> model)
        {
            if (Field.props == null) return;

            if (Field.filterType == "locationField")
            {
                if (model.ContainsKey(Field.key))
                {
                    using (JsonDocument doc = JsonDocument.Parse(Field.props.ToString()))
                    {
                        var props = doc.RootElement.EnumerateObject();

                        var mappingProp = props.FirstOrDefault(x => x.Name == "mappingColumns").Value;
                        if (mappingProp.ValueKind == JsonValueKind.Object)
                        {
                            IEnumerable<JsonProperty> fieldValues = null;

                            if (model[Field.key] != null)
                            {
                                JsonElement jsonElement;
                                if (model[Field.key] is JsonElement) jsonElement = (JsonElement)model[Field.key];
                                else jsonElement = JsonSerializer.Deserialize<JsonElement>(JsonSerializer.Serialize(model[Field.key]));

                                if (jsonElement.ValueKind == JsonValueKind.Object)
                                    fieldValues = jsonElement.EnumerateObject();
                            }

                            // only get the mappings that already configed.
                            var mappings = mappingProp.EnumerateObject().Where(m => m.Value.GetString() != null);

                            foreach (var mapping in mappings)
                            {
                                var key = mapping.Value.GetString();

                                object value = null;
                                if (fieldValues != null)
                                    value = fieldValues.FirstOrDefault(x => x.Name == mapping.Name).Value;

                                if (model.ContainsKey(key))
                                    model[key] = value;
                                else
                                    model.Add(key, value);
                            }
                        }
                    }

                    model.Remove(Field.key);
                }
            }
        }

        public override void BeforeDeleted(IEnumerable<object> dataIds)
        {
            return;
        }

        public override void AfterDeleted()
        {
            return;
        }
    }

    [FilterType("locationField")]
    public class LocationComparer : ValueComparerBase
    {
        private IEnumerable<string> _keys;

        public override bool Equals(object v1, object v2)
        {
            if (ReferenceEquals(v1, v2))
                return true;

            if (v1 == null || v2 == null)
                return false;

            // value of location should be IDictionary, otherwise throw exception
            var x = (IDictionary<string, object>)v1;
            var y = (IDictionary<string, object>)v2;

            GetKeys();

            foreach (var key in _keys)
            {
                if (!x.ContainsKey(key) && !y.ContainsKey(key)) continue;
                if (!x.ContainsKey(key) || !y.ContainsKey(key))
                    return false;

                var valueX = x[key];
                var valueY = y[key];

                if (valueX == null && valueY == null)
                    continue;

                if (valueX == null || valueY == null)
                    return false;

                if (key == "fromMeasure" || key == "toMeasure" || key == "measure")
                {
                    if (!decimal.Equals(Convert.ToDecimal(valueX), Convert.ToDecimal(valueY))) return false;
                }
                else
                {
                    if (!valueX.Equals(valueY)) return false;
                }
            }

            return true;
        }

        public override int GetHashCode(object val)
        {
            if (val == null)
                return 0;

            // value of location should be IDictionary, otherwise throw exception
            var obj = (IDictionary<string, object>)val;

            GetKeys();

            int hashCode = 17;

            foreach (var key in _keys)
            {
                if (obj.ContainsKey(key))
                {
                    var keyCode = key.GetHashCode();
                    var valueCode = 0;
                    if (obj.ContainsKey(key) && obj[key] != null)
                    {
                        if (key == "fromMeasure" || key == "toMeasure" || key == "measure")
                        {
                            valueCode = Convert.ToDecimal(obj[key]).GetHashCode();
                        }
                        else
                            valueCode = obj[key].GetHashCode();
                    }

                    hashCode = hashCode * 23 + keyCode + valueCode;
                }
            }

            return hashCode;
        }

        private void GetKeys()
        {
            if (_keys == null)
            {
                using (JsonDocument doc = JsonDocument.Parse(Field.props.ToString()))
                {
                    var props = doc.RootElement.EnumerateObject();

                    var mappingProp = props.FirstOrDefault(x => x.Name == "mappingColumns").Value;
                    if (mappingProp.ValueKind == JsonValueKind.Object)
                    {
                        // only get the mappings that already configed.
                        var mappings = mappingProp.EnumerateObject().Where(m => m.Name != null);
                        _keys = mappings.Select(m => m.Name).ToList();
                    }
                }
            }

            if (_keys == null) throw new Exception("Configration error for location field.");
        }

        public override string GetValueString(object val)
        {
            // value of location should be IDictionary, otherwise throw exception
            var obj = (IDictionary<string, object>)val;

            GetKeys();

            foreach (var key in _keys)
            {
                if (!obj.ContainsKey(key))
                {
                    obj.Remove(key);
                }
            }

            return JsonSerializer.Serialize(obj);
        }
    }
}
