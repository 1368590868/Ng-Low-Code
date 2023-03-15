using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System;

namespace DataEditorPortal.Web.Common.License
{
    public class LicenseActionFilter : IActionFilter
    {
        private readonly ILicenseService _licenseService;
        public LicenseActionFilter(ILicenseService licenseService)
        {
            _licenseService = licenseService;
        }

        public void OnActionExecuting(ActionExecutingContext context)
        {
            var endpoint = context.HttpContext.GetEndpoint();
            if (endpoint?.Metadata?.GetMetadata<NoLicenseCheckAttribute>() is object) return;

            var license = _licenseService.GetLicense();

            if (_licenseService.IsExpired(license))
            {
                //context.HttpContext.Response.StatusCode = 420;
                context.Result = new JsonResult(new { licenseIsNotValid = !_licenseService.IsValid(license), licenseIsExpired = true });
            }
        }

        public void OnActionExecuted(ActionExecutedContext context)
        {
            // Do something after the action executes.
        }
    }

    public class NoLicenseCheckAttribute : Attribute
    {
        public NoLicenseCheckAttribute() { }
    }

}
