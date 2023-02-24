using AutoMapper;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
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
        bool IsAdmin(string username);
        bool HasAdmin();
        Guid CreateUser(User model, string roleName);
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

            if (IsAdmin(username))
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

        public bool IsAdmin(string username)
        {
            var query = from u in _depDbContext.Users
                        join up in _depDbContext.UserPermissions on u.Id equals up.UserId
                        join sr in _depDbContext.SiteRoles on up.PermissionGrantId equals sr.Id
                        where up.GrantType == "Group" && u.Username == username
                        select u.Id;
            return query.Any();
        }

        public bool HasAdmin()
        {
            var query = from u in _depDbContext.Users
                        join up in _depDbContext.UserPermissions on u.Id equals up.UserId
                        join sr in _depDbContext.SiteRoles on up.PermissionGrantId equals sr.Id
                        where up.GrantType == "Group"
                        select u.Id;
            return query.Any();
        }

        public Guid CreateUser(User model, string roleName)
        {
            var username = AppUser.ParseUsername(_httpContextAccessor.HttpContext.User.Identity.Name).Username;
            var user = _depDbContext.Users.FirstOrDefault(x => x.Username == username);

            var dep_user = new User();
            dep_user.Id = Guid.NewGuid();
            dep_user.Name = model.Name;
            dep_user.Username = model.Username;
            dep_user.Employer = model.Employer;
            dep_user.Vendor = model.Vendor;
            dep_user.AutoEmail = model.AutoEmail;
            dep_user.Comments = "ACTIVE";
            dep_user.Email = model.Email;
            dep_user.Phone = model.Phone;

            var role = _depDbContext.SiteRoles.FirstOrDefault(x => x.RoleName == roleName);
            if (role != null)
            {
                var permission = new UserPermission()
                {
                    GrantType = "GROUP",
                    UserId = dep_user.Id,
                    PermissionGrantId = role.Id,
                    CreatedBy = user != null ? user.Id : Guid.Empty,
                    CreatedDate = DateTime.UtcNow
                };

                _depDbContext.UserPermissions.Add(permission);
            }

            _depDbContext.Users.Add(dep_user);
            _depDbContext.SaveChanges();

            return dep_user.Id;
        }

    }
}
