using DataEditorPortal.Web.Models;
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

        private readonly IServiceProvider _serviceProvider;

        public AttachmentProcessor(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public override void PreProcess(IDictionary<string, object> model)
        {
            ProcessFileUploadFileds(model);
        }

        public override void PostProcess(IDictionary<string, object> model)
        {
            if (_uploadeFiledMeta != null)
            {
                SaveUploadedFiles(model);
            }
        }

        public override void FetchValue(IDictionary<string, object> model)
        {
            return;
        }

        private void ProcessFileUploadFileds(IDictionary<string, object> model)
        {
            var service = _serviceProvider.GetRequiredService<IUniversalGridService>();
            var attachmentCols = service.GetAttachmentCols(Config);

            if (Field.filterType == "attachments")
            {
                if (model.ContainsKey(Field.key))
                {
                    if (model[Field.key] != null)
                    {
                        var jsonOptions = new JsonSerializerOptions() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
                        var jsonElement = (JsonElement)model[Field.key];
                        if (jsonElement.ValueKind == JsonValueKind.Array || jsonElement.ValueKind == JsonValueKind.String)
                        {
                            _uploadeFiledMeta = new UploadedFileMeta()
                            {
                                FieldName = Field.key,
                                UploadedFiles = JsonSerializer.Deserialize<List<UploadedFileModel>>(jsonElement.ToString(), jsonOptions),
                                FileUploadConfig = attachmentCols.FirstOrDefault(c => c.field == Field.key).fileUploadConfig
                            };
                        }
                    }
                    model.Remove(Field.key);
                }
            }
        }

        private void SaveUploadedFiles(IDictionary<string, object> model)
        {
            var attachmentService = _serviceProvider.GetRequiredService<IAttachmentService>();
            attachmentService.SaveUploadedFiles(_uploadeFiledMeta, model, Config.Name, Conn, Trans);
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
}
