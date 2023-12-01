using Microsoft.Identity.Web;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;

namespace DataEditorPortal.Web.Models
{

    public class AppUser
    {
        public Guid Id { get; set; }
        public string Username { get; set; }
        public string Domain { get; set; }
        public bool Authenticated { get; set; }

        public string DisplayName { get; set; }
        public string Email { get; set; }

        public string Vendor { get; set; }

        public bool IsAdmin { get; set; }

        public bool Disabled { get; set; }

        public List<MenuItem> UserMenus { get; set; } = new List<MenuItem>();

        public Dictionary<string, bool> Permissions { get; set; } = new Dictionary<string, bool>();

        public static AppUser FromClaimsPrincipal(ClaimsPrincipal user)
        {
            AppUser appUser = new AppUser();
            if (user == null || user.Identity == null)
            {
                return appUser;
            }

            appUser.Authenticated = user.Identity.IsAuthenticated;

            var oid = user.GetObjectId();
            if (oid != null)
            {
                // azure ad
                appUser.Username = Guid.Parse(oid).ToString();
                appUser.DisplayName = user.GetDisplayName();
                appUser.Domain = user.GetDomainHint();
            }
            else
            {
                string identityName = user.Identity.Name;
                if (!string.IsNullOrEmpty(identityName))
                {
                    var parts = identityName.Split('\\', StringSplitOptions.RemoveEmptyEntries).ToList();
                    if (parts.Count > 1)
                    {
                        appUser.Domain = parts.First();
                        appUser.Username = parts.Last();
                    }
                    else
                    {
                        appUser.Username = parts.Last();
                    }
                    appUser.DisplayName = appUser.Username;
                }
            }

            return appUser;
        }
    }

    public class UserPermissions
    {
        public List<AppRolePermission> Permissions { get; set; }
    }
}