using DataEditorPortal.Web.Models;
using DataEditorPortal.Web.Models.UniversalGrid;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace DataEditorPortal.Web.Services
{
    [FilterType("attachmentField")]
    public class AttachmentProcessor : ValueProcessorBase
    {
        private UploadedFileMeta _uploadeFiledMeta;

        private readonly IServiceProvider _serviceProvider;
        private readonly IQueryBuilder _queryBuilder;
        private readonly IDapperService _dapperService;

        public AttachmentProcessor(IServiceProvider serviceProvider, IQueryBuilder queryBuilder, IDapperService dapperService)
        {
            _serviceProvider = serviceProvider;
            _queryBuilder = queryBuilder;
            _dapperService = dapperService;
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

            if (Field.filterType == "attachmentField")
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
                                GridName = Config.Name,
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
            // get the latest values for current data. 
            var values = GetDetailValue(model);
            // pass it to attachment service, the servcie will use the value in models.
            var attachmentService = _serviceProvider.GetRequiredService<IAttachmentService>();
            attachmentService.SaveUploadedFiles(_uploadeFiledMeta, values, Conn, Trans);
        }

        public override void BeforeDeleted(IEnumerable<object> dataIds)
        {
            var service = _serviceProvider.GetRequiredService<IUniversalGridService>();
            var attachmentCols = service.GetAttachmentCols(Config);
            var fileUploadConfig = attachmentCols.FirstOrDefault(c => c.field == Field.key).fileUploadConfig;
            var referenceDataKey = fileUploadConfig.GetMappedColumn("REFERENCE_DATA_KEY");

            var dsConfig = JsonSerializer.Deserialize<DataSourceConfig>(Config.DataSourceConfig);
            var refValues = dataIds;
            if (dsConfig.IdColumn != referenceDataKey)
            {
                var queryText = _queryBuilder.GenerateSqlTextForDetail(dsConfig, true);
                var param = _queryBuilder.GenerateDynamicParameter(
                    new List<KeyValuePair<string, object>>() { new KeyValuePair<string, object>(dsConfig.IdColumn, dataIds) }
                );
                refValues = _dapperService.Query(Conn, queryText, param, Trans).Cast<IDictionary<string, object>>().Select(x => x[referenceDataKey]);
            }

            var attachmentService = _serviceProvider.GetRequiredService<IAttachmentService>();
            attachmentService.RemoveFiles(fileUploadConfig, refValues, Conn, Trans);

            return;
        }

        public override void AfterDeleted()
        {
            return;
        }

        private IDictionary<string, object> GetDetailValue(IDictionary<string, object> model)
        {
            var dsConfig = JsonSerializer.Deserialize<DataSourceConfig>(Config.DataSourceConfig);

            var queryText = _queryBuilder.GenerateSqlTextForDetail(dsConfig);
            var param = _queryBuilder.GenerateDynamicParameter(
                new List<KeyValuePair<string, object>>() { new KeyValuePair<string, object>(dsConfig.IdColumn, model[dsConfig.IdColumn]) }
            );
            return _dapperService.QueryFirst(Conn, queryText, param, Trans) as IDictionary<string, object>;
        }
    }
}
