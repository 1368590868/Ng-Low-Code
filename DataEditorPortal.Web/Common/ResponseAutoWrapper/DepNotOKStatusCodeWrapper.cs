using Cuture.AspNetCore.ResponseAutoWrapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System;

namespace DataEditorPortal.Web.Common.ResponseAutoWrapper
{
    public class DepNotOKStatusCodeWrapper :
        IActionResultWrapper<GenericApiResponse<int, string, object>, int, string>,
        INotOKStatusCodeWrapper<GenericApiResponse<int, string, object>, int, string>
    {
        public GenericApiResponse<int, string, object> Wrap(ResultExecutingContext context)
        {
            throw new NotImplementedException();
        }

        public GenericApiResponse<int, string, object> Wrap(HttpContext context)
        {
            // do not wrap;
            return null;
        }
    }
}
