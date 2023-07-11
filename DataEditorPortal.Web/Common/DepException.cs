using System;

namespace DataEditorPortal.Web.Common
{
    public class DepException : Exception
    {
        public int StatusCode { get; set; }
        public DepException(string msg, int statusCode = 500, Exception innerException = null) : base(msg, innerException)
        {
            StatusCode = statusCode;
        }
    }
}
