using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Models.UniversalGrid;
using System.Collections.Generic;
using System.Data;

namespace DataEditorPortal.Web.Services
{
    public abstract class ValueProcessorBase
    {
        public UniversalGridConfiguration Config;
        public FormFieldConfig Field;
        public IDbConnection Conn { get; set; }
        public IDbTransaction Trans { get; set; }

        public abstract void PreProcess(IDictionary<string, object> model);
        public abstract void PostProcess(IDictionary<string, object> model);
        public abstract void FetchValue(IDictionary<string, object> model);
        public abstract void BeforeDeleted(IEnumerable<object> dataIds);
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
