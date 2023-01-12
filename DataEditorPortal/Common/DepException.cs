using AutoWrapper.Wrappers;

namespace DataEditorPortal.Web.Common
{
    public class DepException : ApiException
    {
        public DepException(string msg, string title = "Error")
            : base(new { exceptionTitle = title, exceptionMessage = msg }, 500)
        {
        }
    }
}
