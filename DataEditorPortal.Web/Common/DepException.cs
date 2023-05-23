using AutoWrapper.Wrappers;

namespace DataEditorPortal.Web.Common
{
    public class DepException : ApiException
    {
        //public DepException(string msg, string title, int statusCode)
        //    : base(new { exceptionTitle = title, exceptionMessage = msg }, statusCode)
        //{
        //}

        public DepException(string msg)
            : base(msg, 500)
        {
        }

        //public DepException(string msg, int statusCode)
        //    : this(msg, "Error", statusCode)
        //{
        //}
    }
}
