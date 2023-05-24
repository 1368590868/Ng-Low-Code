using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Models;
using DataEditorPortal.Web.Models.UniversalGrid;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace DataEditorPortal.Web.Services
{
    [FilterType("locationField")]
    public class LocationProcessor : ValueProcessorBase
    {
        private UploadedFileMeta _uploadeFiledMeta;
        private UniversalGridConfiguration _config;

        private readonly IServiceProvider _serviceProvider;

        public LocationProcessor(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public override void PreProcess(UniversalGridConfiguration config, FormFieldConfig field, IDictionary<string, object> model)
        {
            _config = config;
            ProcessLocationFiled(field, model);
        }

        public override void PostProcess(object dataId)
        {
            return;
        }

        public override void FetchValue(UniversalGridConfiguration config, FormFieldConfig field, object dataId, IDictionary<string, object> model)
        {
            if (field.props == null) return;

            using (JsonDocument doc = JsonDocument.Parse(field.props.ToString()))
            {
                var props = doc.RootElement.EnumerateObject();

                var mappingProp = props.FirstOrDefault(x => x.Name == "mappingColumns").Value;
                if (mappingProp.ValueKind == JsonValueKind.Object)
                {
                    var valueModel = new Dictionary<string, object>();
                    foreach (var mapping in mappingProp.EnumerateObject())
                    {
                        var key = mapping.Value.GetString();
                        if (model.ContainsKey(key))
                            valueModel.Add(mapping.Name, model[key]);
                    }

                    if (model.ContainsKey(field.key))
                        model[field.key] = valueModel;
                    else
                        model.Add(field.key, valueModel);
                }
            }
        }

        private void ProcessLocationFiled(FormFieldConfig field, IDictionary<string, object> model)
        {
            if (field.props == null) return;

            if (field.filterType == "locationField")
            {
                if (model.ContainsKey(field.key))
                {
                    using (JsonDocument doc = JsonDocument.Parse(field.props.ToString()))
                    {
                        var props = doc.RootElement.EnumerateObject();

                        var mappingProp = props.FirstOrDefault(x => x.Name == "mappingColumns").Value;
                        if (mappingProp.ValueKind == JsonValueKind.Object)
                        {
                            var jsonElement = (JsonElement)model[field.key];
                            foreach (var mapping in mappingProp.EnumerateObject())
                            {
                                var key = mapping.Value.GetString();
                                var value = jsonElement.EnumerateObject().FirstOrDefault(x => x.Name == mapping.Name).Value;

                                if (model.ContainsKey(key))
                                    model[key] = value;
                                else
                                    model.Add(key, value);
                            }
                        }
                    }
                    model.Remove(field.key);
                }
            }
        }
    }
}
