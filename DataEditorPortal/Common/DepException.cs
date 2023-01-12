using AutoWrapper.Wrappers;

namespace DataEditorPortal.Web.Common
{
    public class DepException : ApiException
    {
        public DepException(string msg) : base(msg)
        {
            StatusCode = 200;
        }
    }
}
