using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Models.UniversalGrid;
using System.Collections.Generic;

namespace DataEditorPortal.Web.Services
{
    public abstract class ValueProcessorBase
    {
        public abstract void PreProcess(UniversalGridConfiguration config, FormFieldConfig field, IDictionary<string, object> model);
        public abstract void PostProcess(IDictionary<string, object> model);
        public abstract void FetchValue(UniversalGridConfiguration config, FormFieldConfig field, IDictionary<string, object> model);
        public abstract void BeforeDeleted(UniversalGridConfiguration config, FormFieldConfig field, IEnumerable<object> dataIds);
        public abstract void AfterDeleted();
    }

    [System.AttributeUsage(System.AttributeTargets.Class | System.AttributeTargets.Struct, AllowMultiple = false)]
    public class FilterTypeAttribute : System.Attribute
    {
        string Name;

        public FilterTypeAttribute(string name)
        {
            Name = name;
        }

        public string GetFilterType() => Name;
    }
}
