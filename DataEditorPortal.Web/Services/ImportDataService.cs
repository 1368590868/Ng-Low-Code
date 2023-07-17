using DataEditorPortal.Data.Common;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Models;
using DataEditorPortal.Web.Models.UniversalGrid;
using DataEditorPortal.Web.Services.FieldImporter;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text.Json;

namespace DataEditorPortal.Web.Services
{
    public interface IImportDataServcie
    {
        Stream GenerateImportTemplate(string name, ImportType type);
        IEnumerable<IDictionary<string, object>> GetSourceData(string name, ImportType type, UploadedFileModel uploadedFile, bool removeFile = false);
        IList<FormFieldConfig> ValidateImportedData(string name, ImportType type, IEnumerable<IDictionary<string, object>> sourceObjs);
        IEnumerable<IDictionary<string, object>> GetTransformedSourceData(string name, ImportType type, UploadedFileModel uploadedFile);
    }

    public class ImportDataService : IImportDataServcie
    {
        private readonly ILogger<ImportDataService> _logger;
        private readonly IHostEnvironment _hostEnvironment;
        private readonly IUniversalGridService _universalGridService;
        private readonly IMemoryCache _memoryCache;
        private readonly IServiceProvider _serviceProvider;

        public ImportDataService(
            ILogger<ImportDataService> logger,
            IHostEnvironment hostEnvironment,
            IUniversalGridService universalGridService,
            IMemoryCache memoryCache,
            IServiceProvider serviceProvider)
        {
            _logger = logger;
            _hostEnvironment = hostEnvironment;
            _universalGridService = universalGridService;
            _memoryCache = memoryCache;
            _serviceProvider = serviceProvider;
        }

        #region Get data from excel

        public IEnumerable<IDictionary<string, object>> GetSourceData(string name, ImportType type, UploadedFileModel uploadedFile, bool removeFile = false)
        {
            var config = _universalGridService.GetUniversalGridConfiguration(name);
            var fields = GetTemplateFields(config, type);

            string tempFolder = Path.Combine(_hostEnvironment.ContentRootPath, "App_Data\\FileUploadTemp");
            var tempFilePath = Path.Combine(tempFolder, $"{uploadedFile.FileId} - {uploadedFile.FileName}");
            if (!File.Exists(tempFilePath)) throw new DepException("Uploaded File doesn't exist.");

            IEnumerable<IDictionary<string, object>> sourceObjs = null;
            using (var stream = File.OpenRead(tempFilePath))
            {
                using (var package = new ExcelPackage(stream))
                {
                    if (package.Workbook != null && package.Workbook.Worksheets.Any())
                    {
                        var worksheet = package.Workbook.Worksheets[0];

                        try
                        {
                            var dt = worksheet.Cells[worksheet.Dimension.Address].ToDataTable(config =>
                            {
                                config.PredefinedMappingsOnly = true;
                                var index = 0;
                                fields.ForEach(field =>
                                {
                                    switch (field.filterType)
                                    {
                                        case "locationField":
                                            _serviceProvider.GetRequiredService<LocationFieldImporter>().ConfigFieldMapping(config, field, ref index);
                                            break;
                                        default:
                                            _serviceProvider.GetRequiredService<SimpleFieldImporter>().ConfigFieldMapping(config, field, ref index);
                                            break;
                                    }
                                });
                            });
                            sourceObjs = GetDataTableDictionaryList(dt).ToList();
                        }
                        catch (Exception ex)
                        {
                            throw new DepException(ex.Message);
                        }
                    }
                    else
                    {
                        throw new DepException("The uploaded excel should have at least one worksheet.");
                    }
                }
            }

            if (removeFile) File.Delete(tempFilePath);

            return sourceObjs;
        }

        private IEnumerable<IDictionary<string, object>> GetDataTableDictionaryList(DataTable dt)
        {
            return dt.AsEnumerable().Select(
                row => dt.Columns.Cast<DataColumn>().ToDictionary(
                    column => column.ColumnName,
                    column =>
                    {
                        var value = row[column];
                        if (value == null || value == DBNull.Value) return null;
                        else return value;
                    }
                ));
        }

        public IEnumerable<IDictionary<string, object>> GetTransformedSourceData(string name, ImportType type, UploadedFileModel uploadedFile)
        {
            var sourceObjs = GetSourceData(name, type, uploadedFile, true);

            var config = _universalGridService.GetUniversalGridConfiguration(name);
            var fields = GetTemplateFields(config, type);

            foreach (var obj in sourceObjs)
            {
                foreach (var field in fields)
                {
                    switch (field.filterType)
                    {
                        case "locationField":
                            _serviceProvider.GetRequiredService<LocationFieldImporter>().TransformValue(field, obj);
                            break;
                        default:
                            _serviceProvider.GetRequiredService<SimpleFieldImporter>().TransformValue(field, obj);
                            break;
                    }
                }
            }

            return sourceObjs;
        }

        #endregion

        public Stream GenerateImportTemplate(string name, ImportType type)
        {
            var config = _universalGridService.GetUniversalGridConfiguration(name);

            var fields = GetTemplateFields(config, type);
            fields.ForEach(f => RemoveMemoryCache(f.key));

            var stream = new MemoryStream();
            using (var p = new ExcelPackage(stream))
            {
                var ws = p.Workbook.Worksheets.Add(config.Name);

                var columnIndex = 1;
                foreach (var field in fields)
                {
                    switch (field.filterType)
                    {
                        case "locationField":
                            _serviceProvider.GetRequiredService<LocationFieldImporter>().SetWorksheetColumn(field, ws, ref columnIndex);
                            break;
                        default:
                            _serviceProvider.GetRequiredService<SimpleFieldImporter>().SetWorksheetColumn(field, ws, ref columnIndex);
                            break;
                    }
                }

                var headerRange = ws.Cells[1, 1, 1, columnIndex - 1];
                headerRange.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                headerRange.Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                headerRange.Style.Fill.BackgroundColor.SetColor(System.Drawing.ColorTranslator.FromHtml($"#ccc"));
                headerRange.Style.Font.Size = 11;
                headerRange.Style.Font.Bold = true;
                headerRange.Style.WrapText = true;
                ws.Row(1).Height = 30;

                ws.View.ShowGridLines = true;
                ws.View.FreezePanes(2, 1);

                p.Save();
            }

            stream.Seek(0, SeekOrigin.Begin);
            return stream;
        }

        public IList<FormFieldConfig> ValidateImportedData(string name, ImportType type, IEnumerable<IDictionary<string, object>> sourceObjs)
        {
            if (sourceObjs == null) throw new ArgumentNullException("sourceObjs");
            if (!sourceObjs.Any()) throw new DepException("No records in template for importing.");

            var config = _universalGridService.GetUniversalGridConfiguration(name);
            var dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);
            var idColumn = dataSourceConfig.IdColumn;

            var fields = GetTemplateFields(config, type);
            var columns = new List<FormFieldConfig>();

            foreach (var field in fields)
            {
                switch (field.filterType)
                {
                    case "locationField":
                        columns.AddRange(_serviceProvider.GetRequiredService<LocationFieldImporter>().GetFields(field));
                        break;
                    default:
                        columns.AddRange(_serviceProvider.GetRequiredService<SimpleFieldImporter>().GetFields(field));
                        break;
                }
            }

            foreach (var obj in sourceObjs)
            {
                var errorMsg = new List<ReviewImportError>();
                var hasMissingField = false;

                foreach (var field in fields)
                {
                    switch (field.filterType)
                    {
                        case "locationField":
                            errorMsg.AddRange(_serviceProvider.GetRequiredService<LocationFieldImporter>().ValidateValue(field, obj, ref hasMissingField));
                            break;
                        default:
                            errorMsg.AddRange(_serviceProvider.GetRequiredService<SimpleFieldImporter>().ValidateValue(field, obj, ref hasMissingField));
                            break;
                    }
                }

                var status = errorMsg.Any() ? ReviewImportStatus.ValidationError : ReviewImportStatus.ReadyToImport;
                if (hasMissingField) status = ReviewImportStatus.MissingFields;

                obj.Add("__status__", status);
                obj.Add("__errors__", errorMsg);
            }

            if (sourceObjs.First().ContainsKey(idColumn))
            {
                // validate duplicate
                var duplicates = sourceObjs.Where(x => (ReviewImportStatus)x["__status__"] == ReviewImportStatus.ReadyToImport)
                    .Where(x => sourceObjs.Count(y => y[idColumn] == x[idColumn]) > 1);
                foreach (var item in duplicates)
                    item["__status__"] = ReviewImportStatus.Duplicate;

                // check obj exist in db or not
                // get a batch of ids, and then check
                var readyItems = sourceObjs.Where(x => (ReviewImportStatus)x["__status__"] == ReviewImportStatus.ReadyToImport);
                var total = readyItems.Count();
                var pageSize = 10;
                for (var i = 0; i <= total / pageSize; i++)
                {
                    var batch = readyItems.Skip(pageSize * i).Take(pageSize);
                    var ids = batch.Select(obj => obj[idColumn]);
                    var result = _universalGridService.CheckDataExists(name, ids.ToArray());
                    foreach (var obj in batch)
                    {
                        var exists = result.Any(x => string.Compare(x.ToString(), obj[idColumn].ToString(), true) == 0);
                        if (type == ImportType.Add && exists)
                        {
                            obj["__status__"] = ReviewImportStatus.AlreadyExists;
                        }
                        if (type == ImportType.Update && !exists)
                        {
                            obj["__status__"] = ReviewImportStatus.NotExists;
                        }
                    }
                }
            }

            return columns;
        }

        #region Common private methods

        private void RemoveMemoryCache(string fieldKey)
        {
            _memoryCache.Remove($"import_data_required_{fieldKey}");
            _memoryCache.Remove($"import_data_validation_{fieldKey}");
            _memoryCache.Remove($"import_data_options_{fieldKey}");
            _memoryCache.Remove($"import_data_fraction_{fieldKey}");
            _memoryCache.Remove($"import_data_locationField_{fieldKey}");
        }

        private List<FormFieldConfig> GetTemplateFields(UniversalGridConfiguration config, ImportType type)
        {
            GridFormLayout formConfig = null;
            if (type == ImportType.Add)
            {
                formConfig = _universalGridService.GetAddingFormConfig(config);
            }
            else if (type == ImportType.Update)
            {
                formConfig = _universalGridService.GetUpdatingFormConfig(config);
                var dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);
                var idColumn = dataSourceConfig.IdColumn;
                if (!formConfig.FormFields.Any(f => f.key == idColumn))
                    formConfig.FormFields.Insert(0, new FormFieldConfig() { key = idColumn, filterType = "text", props = JsonSerializer.Serialize(new { required = true }) });
            }
            return formConfig.FormFields.Where(x => !x.excludeFromImport && x.filterType != "linkDataField" && x.filterType != "attachments").ToList();
        }

        #endregion
    }
}
