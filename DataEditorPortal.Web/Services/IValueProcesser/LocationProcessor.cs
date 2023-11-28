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

        public override bool Equals(IDictionary<string, object> x, IDictionary<string, object> y)
        {
            if (ReferenceEquals(x, y))
                return true;

            if (x == null || y == null)
                return false;

            GetKeys();

            foreach (var key in _keys)
            {
                if (!x.ContainsKey(key) || !y.ContainsKey(key))
                    return false;

                var valueX = x[key];
                var valueY = y[key];

                if (valueX == null && valueY == null)
                    continue;

                if (valueX == null || !valueX.Equals(valueY))
                    return false;
            }

            return true;
        }

        public override int GetHashCode(IDictionary<string, object> obj)
        {
            if (obj == null)
                return 0;

            GetKeys();

            int hashCode = 17;

            foreach (var key in _keys)
            {
                if (obj.ContainsKey(key))
                {
                    hashCode = hashCode * 23 + key.GetHashCode();
                    hashCode = hashCode * 23 + (obj[key]?.GetHashCode() ?? 0);
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
                        var mappings = mappingProp.EnumerateObject().Where(m => m.Value.GetString() != null);
                        _keys = mappings.Select(m => m.Value.GetString());
                    }
                }
            }

            if (_keys == null) throw new Exception("Configration error for location field.");
        }
    }
}
