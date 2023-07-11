using Cuture.AspNetCore.ResponseAutoWrapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Options;
using System;
using System.Linq;

namespace DataEditorPortal.Web.Common.ResponseAutoWrapper
{
    public class DepInvalidModelStateWrapper :
        IActionResultWrapper<GenericApiResponse<int, string, object>, int, string>,
        IInvalidModelStateWrapper<GenericApiResponse<int, string, object>, int, string>
    {
        private readonly LegacyCompatibleResponseWrapperOptions _options;

        public DepInvalidModelStateWrapper(IOptions<LegacyCompatibleResponseWrapperOptions> wrapperOptionsAccessor)
        {
            _options = wrapperOptionsAccessor?.Value ?? throw new ArgumentNullException(nameof(wrapperOptionsAccessor));
        }

        public GenericApiResponse<int, string, object> Wrap(ResultExecutingContext context)
        {
            throw new NotImplementedException();
        }

        public GenericApiResponse<int, string, object> Wrap(ActionContext context)
        {
            var errorMessages = context.ModelState.Where(m => m.Value?.Errors.Count > 0)
                                              .Select(m => $"{m.Key} - {m.Value?.Errors.FirstOrDefault()?.ErrorMessage}");

            var message = string.Join(Environment.NewLine, errorMessages);
            var code = _options.InvalidModelStateCode;

            context.HttpContext.Response.StatusCode = code;

            // use Exception handling instead OkObjectResult(200)
            throw new DepException(message, code);
        }
    }
}
