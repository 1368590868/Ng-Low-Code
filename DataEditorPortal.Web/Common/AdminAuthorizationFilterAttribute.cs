using DataEditorPortal.Web.Models;
using DataEditorPortal.Web.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace DataEditorPortal.Web.Common
{
    public class AdminAuthorizationFilterAttribute : TypeFilterAttribute
    {
        public AdminAuthorizationFilterAttribute() : base(typeof(AdminAuthorizationFilterImpl))
        {
        }

        private class AdminAuthorizationFilterImpl : IAuthorizationFilter
        {
            private readonly IUserService _userService;

            public AdminAuthorizationFilterImpl(IUserService userService)
            {
                _userService = userService;
            }

            public void OnAuthorization(AuthorizationFilterContext context)
            {
                var user = AppUser.FromWindowsIdentity(context.HttpContext.User?.Identity);
                var isAdmin = _userService.IsAdmin(user.Username);

                if (!isAdmin)
                {
                    context.Result = new StatusCodeResult(403); // Return 403 Forbidden
                    return;
                }
            }
        }
    }
}