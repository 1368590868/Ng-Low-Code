using AutoMapper;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Models;
using DataEditorPortal.Web.Models.UniversalGrid;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace DataEditorPortal.Web.Services
{
    public interface IImportDataServcie
    {
        Stream GenerateImportTemplate(string name, string type);
        IList<IDictionary<string, object>> GetSourceData(string name, UploadedFileModel uploadedFile, bool removeFile = false);
        IList<IDictionary<string, object>> ValidateImportedData(string name, IList<IDictionary<string, object>> sourceObjs);
        IList<IDictionary<string, object>> GetTransformedSourceData(string name, UploadedFileModel uploadedFile);
    }

    public class ImportDataService : IImportDataServcie
    {
        private readonly ILogger<ImportDataService> _logger;
        private readonly DepDbContext _depDbContext;
        private readonly IHostEnvironment _hostEnvironment;
        private readonly IUniversalGridService _universalGridService;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _memoryCache;
        private readonly IServiceProvider _serviceProvider;
        private readonly ILookupService _lookupService;

        public ImportDataService(
            ILogger<ImportDataService> logger,
            DepDbContext depDbContext,
            IHostEnvironment hostEnvironment,
            IUniversalGridService universalGridService,
            IMapper mapper,
            IMemoryCache memoryCache,
            IServiceProvider serviceProvider,
            ILookupService lookupService)
        {
            _logger = logger;
            _depDbContext = depDbContext;
            _hostEnvironment = hostEnvironment;
            _universalGridService = universalGridService;
            _mapper = mapper;
            _memoryCache = memoryCache;
            _serviceProvider = serviceProvider;
            _lookupService = lookupService;
        }

        #region Get data from excel

        public IList<IDictionary<string, object>> GetSourceData(string name, UploadedFileModel uploadedFile, bool removeFile = false)
        {
            var config = _universalGridService.GetUniversalGridConfiguration(name);
            var formConfig = _universalGridService.GetAddingFormConfig(config);
            var fields = GetTemplateFields(formConfig);

            string tempFolder = Path.Combine(_hostEnvironment.ContentRootPath, "wwwroot/FileUploadTemp");
            var tempFilePath = Path.Combine(tempFolder, $"{uploadedFile.FileId} - {uploadedFile.FileName}");
            if (!File.Exists(tempFilePath)) throw new DepException("Uploaded File doesn't exist.");

            IList<IDictionary<string, object>> sourceObjs = null;
            using (var stream = File.OpenRead(tempFilePath))
            {
                using (var package = new ExcelPackage(stream))
                {
                    if (package.Workbook != null && package.Workbook.Worksheets.Any())
                    {
                        var worksheet = package.Workbook.Worksheets[0];

                        var dt = worksheet.Cells[worksheet.Dimension.Address].ToDataTable(config =>
                        {
                            config.PredefinedMappingsOnly = true;
                            fields.ForEach(x =>
                            {
                                config.Mappings.Add(fields.IndexOf(x), x.key, typeof(string), true);
                            });
                        });
                        sourceObjs = GetDataTableDictionaryList(dt).ToList();
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

        public IList<IDictionary<string, object>> GetTransformedSourceData(string name, UploadedFileModel uploadedFile)
        {
            var sourceObjs = GetSourceData(name, uploadedFile, true);

            var config = _universalGridService.GetUniversalGridConfiguration(name);
            var formConfig = _universalGridService.GetAddingFormConfig(config);
            var fields = GetTemplateFields(formConfig);

            foreach (var obj in sourceObjs)
            {
                foreach (var field in fields)
                {
                    if (IsOptionField(field))
                    {
                        var options = GetFieldOptions(field);
                        if (options != null)
                        {
                            if (obj.ContainsKey(field.key))
                            {
                                var value = obj[field.key];
                                var transformed = options.FirstOrDefault(o => string.Compare(o.Label.ToString(), value.ToString(), true) == 0);
                                if (transformed != null)
                                    obj[field.key] = transformed.Value;
                            }
                        }
                    }
                }
            }

            return sourceObjs;
        }

        #endregion

        #region Download Excel Template

        public Stream GenerateImportTemplate(string name, string type)
        {
            var config = _universalGridService.GetUniversalGridConfiguration(name);
            var formConfig = _universalGridService.GetAddingFormConfig(config);

            var fields = GetTemplateFields(formConfig);
            fields.ForEach(f => RemoveMemoryCache(f.key));

            var stream = new MemoryStream();
            using (var p = new ExcelPackage(stream))
            {
                var ws = p.Workbook.Worksheets.Add(config.Name);

                var headerRange = ws.Cells[1, 1, 1, fields.Count];
                headerRange.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                headerRange.Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                headerRange.Style.Fill.BackgroundColor.SetColor(System.Drawing.ColorTranslator.FromHtml($"#ccc"));
                headerRange.Style.Font.Size = 11;
                headerRange.Style.Font.Bold = true;
                headerRange.Style.WrapText = true;
                ws.Row(1).Height = 30;

                var columnIndex = 1;
                foreach (var field in fields)
                {
                    // set excel columns for current field, and move columnIndex to next.
                    columnIndex = SetFieldColumns(field, ws, columnIndex);
                }

                ws.View.ShowGridLines = true;
                ws.View.FreezePanes(2, 1);

                p.Save();
            }

            stream.Seek(0, SeekOrigin.Begin);
            return stream;
        }

        private int SetFieldColumns(FormFieldConfig field, ExcelWorksheet worksheet, int columnIndex)
        {
            worksheet.Column(columnIndex).Width = 30;
            worksheet.Column(columnIndex).AutoFit(30);

            using (JsonDocument doc = JsonDocument.Parse(field.props.ToString()))
            {
                var props = doc.RootElement.EnumerateObject();

                var labelProp = props.FirstOrDefault(x => x.Name == "label").Value;
                if (labelProp.ValueKind == JsonValueKind.String)
                    worksheet.Cells[1, columnIndex].Value = labelProp.GetString();

                var desProp = props.FirstOrDefault(x => x.Name == "description").Value;
                if (desProp.ValueKind == JsonValueKind.String)
                    worksheet.Cells[1, columnIndex].AddComment(desProp.GetString());
            }

            switch (field.filterType)
            {
                case "text":
                    columnIndex = SetStringColumn(field, worksheet, columnIndex);
                    break;
                case "numeric":
                    columnIndex = SetNumericColumn(field, worksheet, columnIndex);
                    break;
                case "date":
                    columnIndex = SetDateTimeColumn(field, worksheet, columnIndex);
                    break;
                case "boolean":
                    columnIndex = SetBooleanColumn(field, worksheet, columnIndex);
                    break;
                case "location":
                    // get the mapping and generate 4 columns in worksheet.
                    break;
                default:
                    break;
            }

            return columnIndex;
        }

        private int SetNumericColumn(FormFieldConfig field, ExcelWorksheet worksheet, int columnIndex)
        {
            int maxFractionDigits = 2;
            double? min = null;
            double? max = null;

            if (field.props != null)
            {
                using (JsonDocument doc = JsonDocument.Parse(field.props.ToString()))
                {
                    var props = doc.RootElement.EnumerateObject();

                    var minProp = props.FirstOrDefault(x => x.Name == "min").Value;
                    if (minProp.ValueKind == JsonValueKind.Number)
                        min = minProp.GetDouble();

                    var maxProp = props.FirstOrDefault(x => x.Name == "max").Value;
                    if (maxProp.ValueKind == JsonValueKind.Number)
                        max = maxProp.GetDouble();

                    var maxFractionDigitsProp = props.FirstOrDefault(x => x.Name == "maxFractionDigits").Value;
                    if (maxFractionDigitsProp.ValueKind == JsonValueKind.Number)
                        maxFractionDigits = maxFractionDigitsProp.GetInt32();
                }
            }

            var digits = "".PadRight(maxFractionDigits, '0');
            worksheet.Column(columnIndex).Style.Numberformat.Format = digits.Length > 0 ? $"#,##0.{digits}" : "#,##0";

            if (min.HasValue || max.HasValue)
            {
                var col = worksheet.Cells[1, columnIndex].Address[0];

                var validation = worksheet.DataValidations.AddDecimalValidation($"{col}2:{col}{worksheet.Rows.EndRow}");
                validation.AllowBlank = !IsRequired(field);
                validation.ShowErrorMessage = true;
                validation.ErrorStyle = OfficeOpenXml.DataValidation.ExcelDataValidationWarningStyle.stop;

                if (min.HasValue && !max.HasValue)
                {
                    validation.Operator = OfficeOpenXml.DataValidation.ExcelDataValidationOperator.greaterThanOrEqual;
                    validation.Formula.Value = min;
                }
                else if (!min.HasValue && max.HasValue)
                {
                    validation.Operator = OfficeOpenXml.DataValidation.ExcelDataValidationOperator.lessThanOrEqual;
                    validation.Formula.Value = max;
                }
                else
                {
                    validation.Operator = OfficeOpenXml.DataValidation.ExcelDataValidationOperator.between;
                    validation.Formula.Value = min;
                    validation.Formula2.Value = max;
                }
            }

            return columnIndex + 1;
        }

        private int SetDateTimeColumn(FormFieldConfig field, ExcelWorksheet worksheet, int columnIndex)
        {
            var col = worksheet.Cells[1, columnIndex].Address[0];

            worksheet.Column(columnIndex).Style.Numberformat.Format = "d-mmm-yy";
            var validation = worksheet.DataValidations.AddDateTimeValidation($"{col}2:{col}{worksheet.Rows.EndRow}");
            validation.AllowBlank = !IsRequired(field);
            validation.ShowErrorMessage = true;
            validation.ErrorStyle = OfficeOpenXml.DataValidation.ExcelDataValidationWarningStyle.stop;
            validation.Formula.Value = new DateTime(1900, 1, 1);
            validation.Formula2.Value = new DateTime(2099, 12, 31);

            return columnIndex + 1;
        }

        private int SetBooleanColumn(FormFieldConfig field, ExcelWorksheet worksheet, int columnIndex)
        {
            var reference = SetExcelDataOptions(worksheet.Workbook, "boolean options", new List<string>() { "Yes", "No" });

            var col = worksheet.Cells[1, columnIndex].Address[0];

            var validation = worksheet.DataValidations.AddListValidation($"{col}2:{col}{worksheet.Rows.EndRow}");
            validation.AllowBlank = !IsRequired(field);
            validation.ShowErrorMessage = true;
            validation.ErrorStyle = OfficeOpenXml.DataValidation.ExcelDataValidationWarningStyle.stop;
            validation.Formula.ExcelFormula = reference;

            return columnIndex + 1;
        }

        private int SetStringColumn(FormFieldConfig field, ExcelWorksheet worksheet, int columnIndex)
        {
            if (IsOptionField(field))
            {
                var options = GetFieldOptions(field);
                if (options != null)
                {
                    var reference = SetExcelDataOptions(worksheet.Workbook, field.key, options.Select(x => x.Value.ToString()).ToList());
                    if (reference != null)
                    {
                        var col = worksheet.Cells[1, columnIndex].Address[0];
                        var validation = worksheet.DataValidations.AddListValidation($"{col}2:{col}{worksheet.Rows.EndRow}");
                        validation.AllowBlank = !IsRequired(field);
                        validation.ShowErrorMessage = true;
                        validation.ErrorStyle = OfficeOpenXml.DataValidation.ExcelDataValidationWarningStyle.stop;
                        validation.Formula.ExcelFormula = reference;
                    }
                }
            }

            return columnIndex + 1;
        }

        private string SetExcelDataOptions(ExcelWorkbook workbook, string optionName, List<string> datas)
        {
            var worksheet = workbook.Worksheets.FirstOrDefault(x => x.Name == "options");
            if (worksheet == null)
            {
                worksheet = workbook.Worksheets.Add("options");
                worksheet.Hidden = eWorkSheetHidden.VeryHidden;
            }

            // find options exists or not in the first row.
            var cell = worksheet.Cells["1:1"].FirstOrDefault(x => x.Value != null && x.Value.ToString() == optionName);

            var row = 1;
            if (cell == null)
            {
                // if cell not exists, set it at the end of columns
                var col = worksheet.Dimension == null ? 1 : worksheet.Dimension.End.Column + 1;
                cell = worksheet.Cells[row, col];
                cell.Value = optionName;
                foreach (var data in datas)
                {
                    row++;
                    worksheet.Cells[row, col].Value = data;
                }
            }

            var colStr = cell.Address[0];
            // return the reference address
            return $"options!${colStr}$2:${colStr}${row}";
        }

        #endregion

        #region Validate Excel data

        public IList<IDictionary<string, object>> ValidateImportedData(string name, IList<IDictionary<string, object>> sourceObjs)
        {
            if (sourceObjs == null) throw new ArgumentNullException("sourceObjs");
            if (sourceObjs.Count == 0) throw new DepException("No records in template for importing.");

            var config = _universalGridService.GetUniversalGridConfiguration(name);
            var dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);
            var formConfig = _universalGridService.GetAddingFormConfig(config);
            var fields = GetTemplateFields(formConfig);

            foreach (var obj in sourceObjs)
            {
                var errorMsg = new List<ReviewImportError>();
                var hasMissingField = false;

                foreach (var field in fields)
                {
                    if (obj.ContainsKey(field.key))
                    {
                        // start to validate.
                        var value = obj[field.key];
                        if (value == null || value == DBNull.Value)
                        {
                            if (IsRequired(field))
                            {
                                errorMsg.Add(new ReviewImportError() { Field = field.key, ErrorMsg = $"{field.key} is required." });
                                hasMissingField = true;
                            }
                        }
                        else
                        {
                            if (!ValidateValueFormat(field, value))
                            {
                                // validate format
                                errorMsg.Add(new ReviewImportError() { Field = field.key, ErrorMsg = $"Invalid value format." });
                            }
                            else
                            {
                                // validate value
                                ValidateValue(field, value).ForEach(error => errorMsg.Add(new ReviewImportError() { Field = field.key, ErrorMsg = error }));

                                // value is in datasource, options and options lookup
                                if (IsOptionField(field))
                                    ValidateOptionsValue(field, value).ForEach(error => errorMsg.Add(new ReviewImportError() { Field = field.key, ErrorMsg = error }));

                                if (!errorMsg.Any())
                                {
                                    // todo: validate form value according to config OnValidate.
                                }
                            }
                        }
                    }
                }

                var status = errorMsg.Any() ? ReviewImportStatus.ValidationError : ReviewImportStatus.ReadyToImport;
                if (hasMissingField) status = ReviewImportStatus.MissingFields;

                obj.Add("__status__", status);
                obj.Add("__errors__", errorMsg);
            }

            // todo: validate unique
            var idColumn = dataSourceConfig.IdColumn;
            if (sourceObjs[0].ContainsKey(idColumn))
            {
                var duplicates = sourceObjs.Where(x => (ReviewImportStatus)x["__status__"] == ReviewImportStatus.ReadyToImport)
                    .Where(x => sourceObjs.Count(y => y[idColumn] == x[idColumn]) > 1);

                foreach (var item in duplicates)
                    item["__status__"] = ReviewImportStatus.Duplicate;
            }

            return sourceObjs;
        }

        private List<string> ValidateValue(FormFieldConfig field, object value)
        {
            List<string> errorMsg = new List<string>();

            if (field.validatorConfig != null)
            {
                var validators = _memoryCache.GetOrCreate($"import_data_validation_{field.key}", entry =>
                {
                    entry.SetSlidingExpiration(TimeSpan.FromMinutes(60));

                    using (JsonDocument doc = JsonDocument.Parse(field.validatorConfig.ToString()))
                    {
                        return doc.RootElement.EnumerateArray()
                            .Where(x => x.ValueKind == JsonValueKind.String)
                            .Select(x => x.GetString())
                            .ToList();
                    }
                });

                DateTime dtVal;
                foreach (var validator in validators)
                {
                    switch (validator)
                    {
                        case "beforetoday":
                            DateTime.TryParse(value.ToString(), out dtVal);
                            if (dtVal >= DateTime.Now.Date) errorMsg.Add("The value should be before today.");
                            break;
                        case "aftertoday":
                            DateTime.TryParse(value.ToString(), out dtVal);
                            if (dtVal <= DateTime.Now.Date) errorMsg.Add("The value should be after today.");
                            break;
                        case "beforeistoday":
                            DateTime.TryParse(value.ToString(), out dtVal);
                            if (dtVal > DateTime.Now.Date) errorMsg.Add("The value should be before or is today.");
                            break;
                        case "afteristoday":
                            DateTime.TryParse(value.ToString(), out dtVal);
                            if (dtVal < DateTime.Now.Date) errorMsg.Add("The value should be after or is today.");
                            break;
                        case "email":
                            if (!new Regex(@"^(([^<>()[\]\\.,;:\s@""]+(\.[^<>()[\]\\.,;:\s@""]+)*)|("".+""))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$").IsMatch(value.ToString()))
                                errorMsg.Add("The value should be an Email format.");
                            break;
                        case "url":
                            if (!new Regex(@"^(((ht|f)tps?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{0,63}[^!@#$%^&*?.\s])?\.)+[a-z]{2,6}\/?").IsMatch(value.ToString()))
                                errorMsg.Add("The value should be an Url format.");
                            break;
                        default:
                            break;
                    }
                }
            }

            return errorMsg;
        }

        private bool ValidateValueFormat(FormFieldConfig field, object value)
        {
            if (value == null) throw new ArgumentNullException("value");

            var type = value.GetType();
            var filterType = field.filterType;
            if (filterType == "numeric")
            {
                if (type == typeof(int) || type == typeof(uint) || type == typeof(short) || type == typeof(ushort) ||
                    type == typeof(long) || type == typeof(float) || type == typeof(decimal) || type == typeof(double))
                {
                    return true;
                }
                else
                {
                    return decimal.TryParse(value.ToString(), out _);
                }
            }
            else if (filterType == "date")
            {
                if (type == typeof(DateTime))
                {
                    return true;
                }
                else
                {
                    return DateTime.TryParse(value.ToString(), out _);
                }
            }
            else if (filterType == "boolean")
            {
                if (type == typeof(bool))
                {
                    return true;
                }
                else
                {
                    var yesOrNo = value.ToString()
                        .Replace("Yes", "True", StringComparison.InvariantCultureIgnoreCase)
                        .Replace("No", "False", StringComparison.InvariantCultureIgnoreCase);
                    return bool.TryParse(yesOrNo, out _);
                }
            }
            else
                return true;
        }

        private List<string> ValidateOptionsValue(FormFieldConfig field, object value)
        {
            List<string> errorMsg = new List<string>();
            if (IsOptionField(field))
            {
                var options = GetFieldOptions(field);
                if (options != null)
                {
                    if (!options.Any(o => string.Compare(o.Label.ToString(), value.ToString(), true) == 0))
                        errorMsg.Add("The value is not a valid option");
                }
            }
            return errorMsg;
        }

        #endregion

        #region Common private methods

        private void RemoveMemoryCache(string fieldKey)
        {
            _memoryCache.Remove($"import_data_required_{fieldKey}");
            _memoryCache.Remove($"import_data_validation_{fieldKey}");
            _memoryCache.Remove($"import_data_options_{fieldKey}");
        }

        private List<FormFieldConfig> GetTemplateFields(GridFormLayout formConfig)
        {
            return formConfig.FormFields.Where(x => x.filterType != "linkDataField" && x.filterType != "attachments").ToList();
        }

        private bool IsRequired(FormFieldConfig field)
        {
            return _memoryCache.GetOrCreate($"import_data_required_{field.key}", entry =>
            {
                entry.SetSlidingExpiration(TimeSpan.FromMinutes(60));

                if (field.props != null)
                {
                    using (JsonDocument doc = JsonDocument.Parse(field.props.ToString()))
                    {
                        var requiredProp = doc.RootElement.EnumerateObject().FirstOrDefault(x => x.Name == "required").Value;
                        if (requiredProp.ValueKind == JsonValueKind.True || requiredProp.ValueKind == JsonValueKind.False)
                            return requiredProp.GetBoolean();
                    }
                }
                return false;
            });
        }

        private bool IsOptionField(FormFieldConfig field)
        {
            return field.filterType == "text"
                && (field.type == "select" || field.type == "multiSelect" || field.type == "checkboxList" || field.type == "radio")
                && field.props != null;
        }

        private List<DropdownOptionsItem> GetFieldOptions(FormFieldConfig field)
        {
            return _memoryCache.GetOrCreate($"import_data_options_{field.key}", entry =>
            {
                entry.SetSlidingExpiration(TimeSpan.FromMinutes(60));

                List<DropdownOptionsItem> options = null;
                if (field.filterType == "text" && field.props != null)
                {
                    using (JsonDocument doc = JsonDocument.Parse(field.props.ToString()))
                    {
                        var props = doc.RootElement.EnumerateObject();

                        var optionsLookupProp = props.FirstOrDefault(x => x.Name == "optionsLookup").Value;
                        try
                        {
                            if (optionsLookupProp.ValueKind == JsonValueKind.Array)
                            {
                                options = optionsLookupProp.EnumerateArray().Select(x => new DropdownOptionsItem()
                                {
                                    Label = x.EnumerateObject().FirstOrDefault(p => p.Name == "label").Value.GetString(),
                                    Value = x.EnumerateObject().FirstOrDefault(p => p.Name == "value").Value.GetString()
                                }).ToList();
                            }
                            else if (optionsLookupProp.ValueKind == JsonValueKind.Object)
                            {
                                var lookupId = optionsLookupProp.EnumerateObject().FirstOrDefault(p => p.Name == "id").Value.GetGuid();
                                options = _lookupService.GetLookups(lookupId);
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, $"GetFieldOptions: {field.key} | {field.props}");
                        }
                    }
                }

                return options;
            });
        }

        #endregion
    }
}
