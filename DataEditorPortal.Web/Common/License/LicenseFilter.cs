using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Hosting;
using System;

namespace DataEditorPortal.Web.Common.License
{
    public class LicenseActionFilter : IActionFilter
    {
        private readonly ILicenseService _licenseService;
        private readonly IWebHostEnvironment _env;
        public LicenseActionFilter(ILicenseService licenseService, IWebHostEnvironment env)
        {
            _licenseService = licenseService;
            _env = env;
        }

        public void OnActionExecuting(ActionExecutingContext context)
        {
            if (_env.IsDevelopment()) return;

            var endpoint = context.HttpContext.GetEndpoint();
            if (endpoint?.Metadata?.GetMetadata<NoLicenseCheckAttribute>() is object) return;

            var license = _licenseService.GetLicense();

            if (_licenseService.IsExpired(license))
            {
                context.HttpContext.Response.StatusCode = 440;
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
