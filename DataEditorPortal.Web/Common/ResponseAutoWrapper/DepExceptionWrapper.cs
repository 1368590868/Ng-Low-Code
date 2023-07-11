using Cuture.AspNetCore.ResponseAutoWrapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Options;
using System;

namespace DataEditorPortal.Web.Common.ResponseAutoWrapper
{
    public class DepExceptionWrapper :
        IActionResultWrapper<GenericApiResponse<int, string, object>, int, string>,
        IExceptionWrapper<GenericApiResponse<int, string, object>, int, string>
    {
        private readonly LegacyCompatibleResponseWrapperOptions _options;

        public DepExceptionWrapper(IOptions<LegacyCompatibleResponseWrapperOptions> wrapperOptionsAccessor)
        {
            _options = wrapperOptionsAccessor?.Value ?? throw new ArgumentNullException(nameof(wrapperOptionsAccessor));
        }

        public GenericApiResponse<int, string, object> Wrap(HttpContext context, Exception exception)
        {
            var code = _options.ExceptionCode;
            var message = _options.ExceptionWrapMessage;

            if (exception is DepException e)
            {
                code = e.StatusCode;
                message = e.Message;
            }

            context.Response.StatusCode = code;

            return new(code) { Message = message };
        }

        public GenericApiResponse<int, string, object> Wrap(ResultExecutingContext context)
        {
            throw new NotImplementedException();
        }
    }
}
