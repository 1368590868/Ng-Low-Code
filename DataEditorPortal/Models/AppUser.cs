using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;

namespace DataEditorPortal.Web.Models
{
    public class AppUserRole
    {
    }

    public class AppUser
    {
        public Guid Id { get; set; }
        public string IdentityName => Domain + "\\" + Username;
        public string Username { get; set; }
        public string Domain { get; set; }
        public bool Authenticated { get; set; }

        public string DisplayName { get; set; }
        public string Email { get; set; }

        public string Vendor { get; set; }

        public bool IsAdmin { get; set; }

        public bool Disabled { get; set; }

        public Dictionary<string, bool> Permissions { get; set; } = new Dictionary<string, bool>();

        public static AppUser ParseUsername(string user)
        {
            AppUser appUser = new AppUser();
            if (!string.IsNullOrEmpty(user))
            {
                var parts = user.Split('\\', StringSplitOptions.RemoveEmptyEntries).ToList();
                if (parts.Count > 1)
                {
                    appUser.Domain = parts.First();
                    appUser.Username = parts.Last();
                }
                else
                {
                    appUser.Username = parts.Last();
                }
            }
            return appUser;
        }

        public static AppUser FromWindowsIdentity(IIdentity identity)
        {
            AppUser appUser = new AppUser();
            if (identity == null)
            {
                return appUser;
            }

            appUser.Authenticated = identity.IsAuthenticated;

            string identityName = identity.Name;
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
            }

            //Query for display name and emails

            return appUser;
        }
    }

    public class UserPermissions
    {
        public List<AppRolePermission> Permissions { get; set; }
    }
}