using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Web.Models;
using DataEditorPortal.Web.Models.UniversalGrid;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using OfficeOpenXml;
using OfficeOpenXml.Export.ToDataTable;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace DataEditorPortal.Web.Services.FieldImporter
{
    public static class FieldImporterExtensions
    {
        public static void AddFieldImporters(this IServiceCollection services)
        {
            var types = Assembly.GetCallingAssembly().GetTypes()
                .Where(x => typeof(SimpleFieldImporter).IsAssignableFrom(x));

            foreach (var type in types)
            {
                services.AddScoped(type);
            }
        }
    }

    public class SimpleFieldImporter
    {
        protected readonly ILogger<ImportDataService> _logger;
        protected readonly DepDbContext _depDbContext;
        protected readonly IHostEnvironment _hostEnvironment;
        protected readonly IUniversalGridService _universalGridService;
        protected readonly IMemoryCache _memoryCache;
        protected readonly ILookupService _lookupService;

        public SimpleFieldImporter(
            ILogger<ImportDataService> logger,
            DepDbContext depDbContext,
            IHostEnvironment hostEnvironment,
            IUniversalGridService universalGridService,
            IMemoryCache memoryCache,
            ILookupService lookupService)
        {
            _logger = logger;
            _depDbContext = depDbContext;
            _hostEnvironment = hostEnvironment;
            _universalGridService = universalGridService;
            _memoryCache = memoryCache;
            _lookupService = lookupService;
        }

        public virtual void ConfigFieldMapping(ToDataTableOptions config, FormFieldConfig field, ref int columnIndex)
        {
            config.Mappings.Add(columnIndex, field.key, typeof(string), true);
            columnIndex++;
        }

        public virtual IEnumerable<FormFieldConfig> GetFields(FormFieldConfig field)
        {
            return new FormFieldConfig[] { field };
        }

        #region Download Excel Template

        public virtual void SetWorksheetColumn(FormFieldConfig field, ExcelWorksheet worksheet, ref int columnIndex)
        {
            worksheet.Column(columnIndex).Width = 20;
            worksheet.Column(columnIndex).AutoFit(20);
            worksheet.Cells[1, columnIndex].Value = field.key;

            if (field.props != null)
            {
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
            }

            switch (field.filterType)
            {
                case "text":
                    SetStringColumn(field, worksheet, columnIndex);
                    break;
                case "numeric":
                    SetNumericColumn(field, worksheet, columnIndex);
                    break;
                case "date":
                    SetDateTimeColumn(field, worksheet, columnIndex);
                    break;
                case "boolean":
                    SetBooleanColumn(field, worksheet, columnIndex);
                    break;
                default:
                    break;
            }

            columnIndex++;
        }

        protected void SetNumericColumn(FormFieldConfig field, ExcelWorksheet worksheet, int columnIndex)
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
        }

        protected void SetDateTimeColumn(FormFieldConfig field, ExcelWorksheet worksheet, int columnIndex)
        {
            var col = worksheet.Cells[1, columnIndex].Address[0];

            worksheet.Column(columnIndex).Style.Numberformat.Format = "mm-dd-yyyy";
            var validation = worksheet.DataValidations.AddDateTimeValidation($"{col}2:{col}{worksheet.Rows.EndRow}");
            validation.AllowBlank = !IsRequired(field);
            validation.ShowErrorMessage = true;
            validation.ErrorStyle = OfficeOpenXml.DataValidation.ExcelDataValidationWarningStyle.stop;
            validation.Formula.Value = new DateTime(1900, 1, 1);
            validation.Formula2.Value = new DateTime(2099, 12, 31);
        }

        protected void SetBooleanColumn(FormFieldConfig field, ExcelWorksheet worksheet, int columnIndex)
        {
            worksheet.Column(columnIndex).Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;

            var reference = SetExcelDataOptions(worksheet.Workbook, "boolean options", new List<string>() { "Yes", "No" });

            var col = worksheet.Cells[1, columnIndex].Address[0];

            var validation = worksheet.DataValidations.AddListValidation($"{col}2:{col}{worksheet.Rows.EndRow}");
            validation.AllowBlank = !IsRequired(field);
            validation.ShowErrorMessage = true;
            validation.ErrorStyle = OfficeOpenXml.DataValidation.ExcelDataValidationWarningStyle.stop;
            validation.Formula.ExcelFormula = reference;
        }

        protected void SetStringColumn(FormFieldConfig field, ExcelWorksheet worksheet, int columnIndex)
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
        }

        protected string SetExcelDataOptions(ExcelWorkbook workbook, string optionName, List<string> datas)
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

        public virtual List<ReviewImportError> ValidateValue(FormFieldConfig field, IDictionary<string, object> obj, ref bool hasMissingField)
        {
            List<ReviewImportError> errorMsg = new List<ReviewImportError>();

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
                    if (!ValidateValueFormat(field, obj))
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

            return errorMsg;
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
                            dtVal = TransformDate(value);
                            if (dtVal >= DateTime.Now.Date) errorMsg.Add("The value should be before today.");
                            break;
                        case "aftertoday":
                            dtVal = TransformDate(value);
                            if (dtVal <= DateTime.Now.Date) errorMsg.Add("The value should be after today.");
                            break;
                        case "beforeistoday":
                            dtVal = TransformDate(value);
                            if (dtVal > DateTime.Now.Date) errorMsg.Add("The value should be before or is today.");
                            break;
                        case "afteristoday":
                            dtVal = TransformDate(value);
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

        private bool ValidateValueFormat(FormFieldConfig field, IDictionary<string, object> obj)
        {
            if (obj == null) throw new ArgumentNullException("obj");
            var value = obj[field.key];
            if (value == null) throw new NullReferenceException("value");

            var type = value.GetType();
            var filterType = field.filterType;
            if (filterType == "numeric")
            {
                var digits = GetFieldFractionDigits(field);
                decimal tempValue;
                if (decimal.TryParse(value.ToString(), out tempValue))
                {
                    obj[field.key] = tempValue.ToString($"N{digits}");
                    return true;
                }
                else
                    return false;

            }
            else if (filterType == "date")
            {
                try
                {
                    obj[field.key] = DateTime.FromOADate(Convert.ToDouble(value)).ToString("MM-dd-yyyy");
                    return true;
                }
                catch
                {
                }
                DateTime tempDate;
                if (DateTime.TryParse(value.ToString(), out tempDate))
                {
                    obj[field.key] = tempDate.ToString("MM-dd-yyyy");
                    return true;
                }
                return false;
            }
            else if (filterType == "boolean")
            {
                if (type == typeof(bool))
                {
                    return true;
                }
                else
                {
                    var yesOrNo = TransformBoolean(value);
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

        #region Transform Value

        public virtual void TransformValue(FormFieldConfig field, IDictionary<string, object> obj)
        {
            if (obj.ContainsKey(field.key))
            {
                if (obj[field.key] == null || obj[field.key] == DBNull.Value) return;

                if (IsOptionField(field))
                {
                    obj[field.key] = TransformOptionLabel(field, obj[field.key]);
                }
                if (field.filterType == "boolean")
                {
                    obj[field.key] = Convert.ToBoolean(TransformBoolean(obj[field.key].ToString()));
                }
                if (field.filterType == "numeric")
                {
                    obj[field.key] = TransformNumber(obj[field.key].ToString());
                }
                if (field.filterType == "date")
                {
                    obj[field.key] = TransformDate(obj[field.key].ToString());
                }
            }
        }

        protected object TransformOptionLabel(FormFieldConfig field, object value)
        {
            if (value == null || value == DBNull.Value) return value;

            var options = GetFieldOptions(field);
            if (options != null)
            {
                var transformed = options.FirstOrDefault(o => string.Compare(o.Label.ToString(), value.ToString(), true) == 0);
                if (transformed != null)
                    return transformed.Value;
            }
            return value;
        }

        protected string TransformBoolean(object value)
        {
            return value.ToString()
                    .Replace("Yes", "True", StringComparison.InvariantCultureIgnoreCase)
                    .Replace("No", "False", StringComparison.InvariantCultureIgnoreCase)
                    .Replace("Y", "False", StringComparison.InvariantCultureIgnoreCase)
                    .Replace("N", "False", StringComparison.InvariantCultureIgnoreCase);
        }

        protected decimal TransformNumber(object value)
        {
            return Convert.ToDecimal(value);
        }

        protected DateTime TransformDate(object value)
        {
            try
            {
                return DateTime.FromOADate(Convert.ToDouble(value));
            }
            catch
            {
            }
            return DateTime.Parse(value.ToString());
        }

        #endregion

        #region Common private methods

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

        private int GetFieldFractionDigits(FormFieldConfig field)
        {
            return _memoryCache.GetOrCreate($"import_data_fraction_{field.key}", entry =>
            {
                entry.SetSlidingExpiration(TimeSpan.FromMinutes(60));

                int maxFractionDigits = 2;

                if (field.props != null)
                {
                    using (JsonDocument doc = JsonDocument.Parse(field.props.ToString()))
                    {
                        var props = doc.RootElement.EnumerateObject();

                        var maxFractionDigitsProp = props.FirstOrDefault(x => x.Name == "maxFractionDigits").Value;
                        if (maxFractionDigitsProp.ValueKind == JsonValueKind.Number)
                            maxFractionDigits = maxFractionDigitsProp.GetInt32();
                    }
                }

                return maxFractionDigits;
            });
        }

        #endregion
    }
}
