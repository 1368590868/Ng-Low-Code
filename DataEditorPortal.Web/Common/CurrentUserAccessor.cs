using DataEditorPortal.Web.Models;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Security.Claims;

namespace DataEditorPortal.Web.Common
{
    public interface ICurrentUserAccessor
    {
        ClaimsPrincipal CurrentUser { get; }
        void SetCurrentUser(ClaimsPrincipal currentUser);
    }
    public class CurrentUserAccessor : ICurrentUserAccessor
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private ClaimsPrincipal _currentUser;

        public CurrentUserAccessor(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public ClaimsPrincipal CurrentUser
        {
            get
            {
                if (_httpContextAccessor.HttpContext != null && _httpContextAccessor.HttpContext.User != null)
                {
                    return _httpContextAccessor.HttpContext.User;
                }
                else
                {
                    if (_currentUser == null)
                        _currentUser = CreateClaimsPrincipal();
                    return _currentUser;
                }
            }
        }


        private ClaimsPrincipal CreateClaimsPrincipal()
        {
            // Creating a set of claims for the user
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, "SYSTEM"),
            };

            // Creating a ClaimsIdentity and associating it with the claims
            var identity = new ClaimsIdentity(claims, "custom", ClaimsIdentity.DefaultNameClaimType, ClaimsIdentity.DefaultRoleClaimType);

            // Creating a ClaimsPrincipal and associating the ClaimsIdentity with it
            var principal = new ClaimsPrincipal(identity);

            return principal;
        }

        public void SetCurrentUser(ClaimsPrincipal currentUser)
        {
            _currentUser = currentUser;
        }
    }

    public static class CurrentUserExtensions
    {
        public static string Username(this ClaimsPrincipal claimsPrincipal)
        {
            return AppUser.FromClaimsPrincipal(claimsPrincipal).Username;
        }

        public static string DisplayName(this ClaimsPrincipal claimsPrincipal)
        {
            return claimsPrincipal.FindFirstValue(DepClaimConstants.DisplayName);
        }

        public static Guid UserId(this ClaimsPrincipal claimsPrincipal)
        {
            var userClaim = claimsPrincipal.FindFirst(DepClaimConstants.UserId);
            if (userClaim != null)
            {
                return Guid.Parse(userClaim.Value);
            }

            return Guid.Empty;
        }
    }
}
