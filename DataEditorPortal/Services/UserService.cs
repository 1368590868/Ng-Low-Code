using AutoMapper;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Web.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;

namespace DataEditorPortal.Web.Services
{
    public interface IUserService
    {
        Dictionary<string, bool> GetUserPermissions();
        bool IsAdmin();
    }

    public class UserService : IUserService
    {
        private readonly DepDbContext _depDbContext;
        private readonly ILogger<UserService> _logger;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserService(
            DepDbContext depDbContext,
            ILogger<UserService> logger,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor)
        {
            _depDbContext = depDbContext;
            _logger = logger;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public Dictionary<string, bool> GetUserPermissions()
        {
            var result = new Dictionary<string, bool>();

            var user = _httpContextAccessor.HttpContext.User;
            var username = AppUser.ParseUsername(user.Identity.Name).Username;
            var userId = _depDbContext.Users.FirstOrDefault(x => x.Username == username).Id;

            if (user.IsInRole("Administrators"))
            {
                var permissions = (from p in _depDbContext.SitePermissions
                                   select new
                                   {
                                       PermissionName = p.PermissionName
                                   }).Distinct().ToList();

                foreach (var p in permissions)
                {
                    result[p.PermissionName] = true;
                }
            }
            else
            {
                var siteRolesPermissions = from up in _depDbContext.UserPermissions
                                           join sr in _depDbContext.SiteRoles on up.PermissionGrantId equals sr.Id
                                           join srp in _depDbContext.SiteRolePermissions on sr.Id equals srp.SiteRoleId
                                           join sp in _depDbContext.SitePermissions on srp.SitePermissionId equals sp.Id
                                           where up.UserId == userId && up.GrantType == "GROUP"
                                           select sp.Id;

                var sitePermissions = from up in _depDbContext.UserPermissions
                                      join sp in _depDbContext.SitePermissions on up.PermissionGrantId equals sp.Id
                                      where up.UserId == userId && up.GrantType == "ITEM"
                                      select sp.Id;

                var permissionsQuery = from p in _depDbContext.SitePermissions
                                       where siteRolesPermissions.Contains(p.Id) || sitePermissions.Contains(p.Id)
                                       select new
                                       {
                                           PermissionName = p.PermissionName
                                       };

                var permissions = permissionsQuery.Distinct().ToList();
                foreach (var p in permissions)
                {
                    result[p.PermissionName] = true;
                }
            }

            return result;
        }

        public bool IsAdmin()
        {
            var user = _httpContextAccessor.HttpContext.User;
            return user.IsInRole("Administrators");
        }
    }
}
