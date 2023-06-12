using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Models;
using DataEditorPortal.Web.Models.UniversalGrid;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace DataEditorPortal.Web.Services
{
    [FilterType("attachments")]
    public class AttachmentProcessor : ValueProcessorBase
    {
        private UploadedFileMeta _uploadeFiledMeta;
        private UniversalGridConfiguration _config;

        private readonly IServiceProvider _serviceProvider;

        public AttachmentProcessor(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public override void PreProcess(UniversalGridConfiguration config, FormFieldConfig field, IDictionary<string, object> model)
        {
            _config = config;
            ProcessFileUploadFileds(field, model);
        }

        public override void PostProcess(object dataId)
        {
            if (_uploadeFiledMeta != null)
            {
                SaveUploadedFiles(dataId);
            }
        }

        public override void FetchValue(UniversalGridConfiguration config, FormFieldConfig field, object dataId, IDictionary<string, object> model)
        {
            return;
        }

        private void ProcessFileUploadFileds(FormFieldConfig field, IDictionary<string, object> model)
        {
            var service = _serviceProvider.GetRequiredService<IUniversalGridService>();
            var attachmentCols = service.GetAttachmentCols(_config);

            if (field.filterType == "attachments")
            {
                if (model.ContainsKey(field.key))
                {
                    if (model[field.key] != null)
                    {
                        var jsonOptions = new JsonSerializerOptions() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
                        var jsonElement = (JsonElement)model[field.key];
                        if (jsonElement.ValueKind == JsonValueKind.Array || jsonElement.ValueKind == JsonValueKind.String)
                        {
                            _uploadeFiledMeta = new UploadedFileMeta()
                            {
                                FieldName = field.key,
                                UploadedFiles = JsonSerializer.Deserialize<List<UploadedFileModel>>(jsonElement.ToString(), jsonOptions),
                                FileUploadConfig = attachmentCols.FirstOrDefault(c => c.field == field.key).fileUploadConfig
                            };
                        }
                    }
                    model.Remove(field.key);
                }
            }
        }

        private void SaveUploadedFiles(object dataId)
        {
            var attachmentService = _serviceProvider.GetRequiredService<IAttachmentService>();
            attachmentService.SaveUploadedFiles(_uploadeFiledMeta, dataId, _config.Name);
        }

        public override void BeforeDeleted(UniversalGridConfiguration config, FormFieldConfig field, IEnumerable<object> dataIds)
        {
            return;
        }

        public override void AfterDeleted()
        {
            return;
        }
    }
}
