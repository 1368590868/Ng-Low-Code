using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Web.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace DataEditorPortal.Web.Common
{
    public static class DepClaimConstants
    {
        public const string UserId = "dep/userid";
        public const string DisplayName = "dep/displayname";
    }

    public class DepUserClaimsTransformation : IClaimsTransformation
    {
        private readonly IMemoryCache _memoryCache;
        private readonly DepDbContext _depDbContext;
        public DepUserClaimsTransformation(DepDbContext depDbContext, IMemoryCache memoryCache)
        {
            _depDbContext = depDbContext;
            _memoryCache = memoryCache;
        }

        public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
        {
            // Check if the principal has already been transformed
            var alreadyTransformed = principal.FindFirst(DepClaimConstants.UserId);

            if (alreadyTransformed == null)
            {
                var username = AppUser.FromClaimsPrincipal(principal).Username;

                if (username != null)
                {
                    var user = _memoryCache.GetOrCreate($"user_{username}", entry =>
                    {
                        var user = _depDbContext.Users.FirstOrDefault(x => x.Username == username);
                        if (user != null)
                        {
                            entry.SetSlidingExpiration(TimeSpan.FromMinutes(30));
                            return user;
                        }
                        else
                        {
                            entry.SetAbsoluteExpiration(TimeSpan.FromTicks(1));
                            return null;
                        }
                    });

                    // Add the user ID as a new claim
                    var userId = user?.Id;
                    var userIdClaim = new Claim(DepClaimConstants.UserId, userId == null ? "" : userId.ToString());
                    ((ClaimsIdentity)principal.Identity).AddClaim(userIdClaim);

                    // Add the user displayName as a new claim
                    var displayName = user?.Name;
                    var displayNameClaim = new Claim(DepClaimConstants.DisplayName, displayName == null ? "" : displayName.ToString());
                    ((ClaimsIdentity)principal.Identity).AddClaim(displayNameClaim);
                }
            }

            return Task.FromResult(principal);
        }
    }
}
