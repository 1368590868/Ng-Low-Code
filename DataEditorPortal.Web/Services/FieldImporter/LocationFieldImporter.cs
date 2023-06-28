using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Web.Models;
using DataEditorPortal.Web.Models.UniversalGrid;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using OfficeOpenXml;
using OfficeOpenXml.Export.ToDataTable;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text.Json;

namespace DataEditorPortal.Web.Services.FieldImporter
{
    public class LocationFieldImporter : SimpleFieldImporter
    {
        public LocationFieldImporter(
            ILogger<ImportDataService> logger,
            DepDbContext depDbContext,
            IHostEnvironment hostEnvironment,
            IUniversalGridService universalGridService,
            IMemoryCache memoryCache,
            ILookupService lookupService) : base(logger, depDbContext, hostEnvironment, universalGridService, memoryCache, lookupService)
        {
        }

        public override void SetWorksheetColumn(FormFieldConfig field, ExcelWorksheet worksheet, ref int columnIndex)
        {
            if (field.props != null)
            {
                using (JsonDocument doc = JsonDocument.Parse(field.props.ToString()))
                {
                    var props = doc.RootElement.EnumerateObject();

                    IEnumerable<string> innerFields = new string[4] { "from", "fromMeasure", "to", "toMeasure" };

                    var locationTypeProp = props.FirstOrDefault(x => x.Name == "locationType").Value;
                    innerFields = locationTypeProp.GetInt32() == 2
                        ? innerFields.Take(2)
                        : locationTypeProp.GetInt32() == 3
                        ? innerFields.Where(x => x != "to")
                        : innerFields;

                    foreach (var key in innerFields)
                    {
                        worksheet.Column(columnIndex).Width = 20;
                        worksheet.Column(columnIndex).AutoFit(20);
                        worksheet.Cells[1, columnIndex].Value = key;

                        var labelProp = props.FirstOrDefault(x => x.Name == $"{key}Label").Value;
                        if (labelProp.ValueKind == JsonValueKind.String)
                            worksheet.Cells[1, columnIndex].Value = labelProp.GetString();

                        var desProp = props.FirstOrDefault(x => x.Name == $"{key}Description").Value;
                        if (desProp.ValueKind == JsonValueKind.String)
                            worksheet.Cells[1, columnIndex].AddComment(desProp.GetString());

                        if (key == "from" || key == "to") SetStringColumn(new FormFieldConfig() { key = key }, worksheet, columnIndex);
                        else SetNumericColumn(new FormFieldConfig() { key = key }, worksheet, columnIndex);

                        columnIndex++;
                    }
                }
            }
        }

        public override void ConfigFieldMapping(ToDataTableOptions config, FormFieldConfig field, ref int columnIndex)
        {
            if (field.props != null)
            {
                using (JsonDocument doc = JsonDocument.Parse(field.props.ToString()))
                {
                    var props = doc.RootElement.EnumerateObject();

                    IEnumerable<string> innerFields = new string[4] { "from", "fromMeasure", "to", "toMeasure" };

                    var locationTypeProp = props.FirstOrDefault(x => x.Name == "locationType").Value;
                    innerFields = locationTypeProp.GetInt32() == 2
                        ? innerFields.Take(2)
                        : locationTypeProp.GetInt32() == 3
                        ? innerFields.Where(x => x != "to")
                        : innerFields;

                    foreach (var key in innerFields)
                    {
                        config.Mappings.Add(columnIndex, $"{field.key}_{key}", typeof(string), true);

                        columnIndex++;
                    }
                }
            }
        }

        public override List<ReviewImportError> ValidateValue(FormFieldConfig field, IDictionary<string, object> obj, ref bool hasMissingField)
        {
            List<ReviewImportError> errorMsg = new List<ReviewImportError>();

            if (field.props != null)
            {
                var meta = _memoryCache.GetOrCreate($"import_data_locationField_{field.key}", entry =>
                {
                    using (JsonDocument doc = JsonDocument.Parse(field.props.ToString()))
                    {
                        entry.SetSlidingExpiration(TimeSpan.FromMinutes(60));

                        var props = doc.RootElement.EnumerateObject();
                        var locationType = props.FirstOrDefault(x => x.Name == "locationType").Value.GetInt32();
                        var optionsLookupProp = props.FirstOrDefault(x => x.Name == "system").Value;
                        IEnumerable<DropdownOptionsItem> options = Enumerable.Empty<DropdownOptionsItem>();
                        if (optionsLookupProp.ValueKind == JsonValueKind.Object)
                        {
                            var lookupId = optionsLookupProp.EnumerateObject().FirstOrDefault(p => p.Name == "id").Value.GetGuid();
                            options = _lookupService.GetLookups(lookupId);
                        }
                        return new
                        {
                            locationType,
                            options
                        };
                    }
                });

                if (meta == null) return errorMsg;

                DropdownOptionsItem route = null;

                // validate from
                var key = $"{field.key}_from";
                var value = obj[key];
                if (value == null || value == DBNull.Value)
                {
                    errorMsg.Add(new ReviewImportError() { Field = key, ErrorMsg = $"{key} is required." });
                    hasMissingField = true;
                }
                else
                {
                    // get and save from route to var route for validate from measure or to measure.
                    route = meta.options.FirstOrDefault(o => string.Compare(o.Value.ToString(), value.ToString(), true) == 0);
                    if (route == null)
                        errorMsg.Add(new ReviewImportError() { Field = key, ErrorMsg = "The value is not a valid option" });
                }

                // validate fromMeasure
                key = $"{field.key}_fromMeasure";
                value = obj[key];
                if (value == null || value == DBNull.Value)
                {
                    errorMsg.Add(new ReviewImportError() { Field = key, ErrorMsg = $"{key} is required." });
                    hasMissingField = true;
                }
                else
                {
                    decimal tempValue;
                    if (decimal.TryParse(value.ToString(), out tempValue))
                    {
                        // validate value range
                        if (route != null)
                        {
                            decimal min = 0;
                            decimal max = 0;
                            decimal.TryParse(route.Value1.ToString(), out min);
                            decimal.TryParse(route.Value2.ToString(), out max);
                            if (tempValue < min || tempValue > max)
                                errorMsg.Add(new ReviewImportError() { Field = key, ErrorMsg = $"Value is not in valid range [min:{min}, max:{max}]." });
                        }
                    }
                    else
                        errorMsg.Add(new ReviewImportError() { Field = key, ErrorMsg = $"Invalid value format." });
                }

                if (meta.locationType == 3 || meta.locationType == 4)
                {
                    if (meta.locationType == 4)
                    {
                        // validate to
                        key = $"{field.key}_to";
                        value = obj[key];
                        if (value == null || value == DBNull.Value)
                        {
                            errorMsg.Add(new ReviewImportError() { Field = key, ErrorMsg = $"{key} is required." });
                            hasMissingField = true;
                        }
                        else
                        {
                            // get and save to route to var route for validate to measure.
                            route = meta.options.FirstOrDefault(o => string.Compare(o.Value.ToString(), value.ToString(), true) == 0);
                            if (route == null)
                                errorMsg.Add(new ReviewImportError() { Field = key, ErrorMsg = "The value is not a valid option" });
                        }
                    }

                    // validate toMeasure
                    key = $"{field.key}_toMeasure";
                    value = obj[key];
                    if (value == null || value == DBNull.Value)
                    {
                        errorMsg.Add(new ReviewImportError() { Field = key, ErrorMsg = $"{key} is required." });
                        hasMissingField = true;
                    }
                    else
                    {
                        decimal tempValue;
                        if (decimal.TryParse(value.ToString(), out tempValue))
                        {
                            // validate value range
                            if (route != null)
                            {
                                decimal min = 0;
                                decimal max = 0;
                                decimal.TryParse(route.Value1.ToString(), out min);
                                decimal.TryParse(route.Value2.ToString(), out max);
                                if (tempValue < min || tempValue > max)
                                    errorMsg.Add(new ReviewImportError() { Field = key, ErrorMsg = $"Value is not in valid range [min:{min}, max:{max}]." });
                            }
                        }
                        else
                            errorMsg.Add(new ReviewImportError() { Field = key, ErrorMsg = $"Invalid value format." });
                    }
                }
            }

            return errorMsg;
        }

        public override IEnumerable<FormFieldConfig> GetFields(FormFieldConfig field)
        {
            if (field.props != null)
            {
                using (JsonDocument doc = JsonDocument.Parse(field.props.ToString()))
                {
                    var props = doc.RootElement.EnumerateObject();

                    IEnumerable<string> innerFields = new string[4] { "from", "fromMeasure", "to", "toMeasure" };

                    var locationTypeProp = props.FirstOrDefault(x => x.Name == "locationType").Value;
                    innerFields = locationTypeProp.GetInt32() == 2
                        ? innerFields.Take(2)
                        : locationTypeProp.GetInt32() == 3
                        ? innerFields.Where(x => x != "to")
                        : innerFields;

                    return innerFields.Select(key =>
                    {
                        var label = key.ToUpper();
                        var labelProp = props.FirstOrDefault(x => x.Name == $"{key}Label").Value;
                        if (labelProp.ValueKind == JsonValueKind.String)
                            label = labelProp.GetString();

                        var description = string.Empty;
                        var desProp = props.FirstOrDefault(x => x.Name == $"{key}Description").Value;
                        if (desProp.ValueKind == JsonValueKind.String)
                            description = desProp.GetString();

                        return new FormFieldConfig()
                        {
                            key = $"{field.key}_{key}",
                            filterType = key == "from" || key == "to" ? "text" : "numeric",
                            props = new { label, description, required = true }
                        };
                    }).ToList();
                }
            }
            return Enumerable.Empty<FormFieldConfig>();
        }

        public override void TransformValue(FormFieldConfig field, IDictionary<string, object> obj)
        {
            if (field.props != null)
            {
                using (JsonDocument doc = JsonDocument.Parse(field.props.ToString()))
                {
                    var props = doc.RootElement.EnumerateObject();

                    IEnumerable<string> innerFields = new string[4] { "from", "fromMeasure", "to", "toMeasure" };

                    var locationTypeProp = props.FirstOrDefault(x => x.Name == "locationType").Value;
                    innerFields = locationTypeProp.GetInt32() == 2
                        ? innerFields.Take(2)
                        : locationTypeProp.GetInt32() == 3
                        ? innerFields.Where(x => x != "to")
                        : innerFields;

                    IDictionary<string, object> dicValue = new Dictionary<string, object>();
                    foreach (var f in innerFields)
                    {
                        dicValue.Add(f, obj[$"{field.key}_{f}"]);
                        obj.Remove($"{field.key}_{f}");
                    }

                    dynamic value = dicValue.Aggregate(
                        new ExpandoObject() as IDictionary<string, object>,
                        (a, p) => { a.Add(p); return a; }
                    );

                    obj.Add(field.key, value);
                }
            }
        }
    }
}
