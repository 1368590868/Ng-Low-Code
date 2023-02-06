using AutoWrapper.Wrappers;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace DataEditorPortal.Web.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly ILogger<UserController> _logger;
        private readonly DepDbContext _depDbContext;

        public UserController(ILogger<UserController> logger, DepDbContext depDbContext)
        {
            _logger = logger;
            _depDbContext = depDbContext;
        }

        [HttpGet]
        [Route("getLoggedInUser")]
        public AppUser GetLoggedInUser()
        {
            var user = AppUser.FromWindowsIdentity(User?.Identity);

            var dep_user = _depDbContext.Users.Where(x => x.Username == user.Username).FirstOrDefault();
            if (dep_user == null)
            {
                dep_user = new Data.Models.User();
                dep_user.Username = user.Username;
                dep_user.Employer = "NONE";
                dep_user.Vendor = "NONE";
                dep_user.AutoEmail = true;
                dep_user.Division = "NONE";

                this.Create(dep_user);
            }

            user.DisplayName = dep_user.Name;
            if (string.IsNullOrEmpty(user.DisplayName))
            {
                user.DisplayName = user.Username;
            }
            user.Email = dep_user.Email;
            user.Vendor = dep_user.Vendor;
            if (dep_user.Comments == "DEACTIVE")
            {
                user.Disabled = true;
            }

            if (!user.Disabled)
            {
                if (User.IsInRole("Administrators"))
                {
                    var permissions = (from p in _depDbContext.SitePermissions
                                       select new
                                       {
                                           PermissionName = p.PermissionName
                                       }).Distinct().ToList();

                    foreach (var p in permissions)
                    {
                        user.Permissions[p.PermissionName] = true;
                    }
                }
                else
                {
                    var siteRolesPermissions = from up in _depDbContext.UserPermissions
                                               join sr in _depDbContext.SiteRoles on up.PermissionGrantId equals sr.Id
                                               join srp in _depDbContext.SiteRolePermissions on sr.Id equals srp.SiteRoleId
                                               join sp in _depDbContext.SitePermissions on srp.SitePermissionId equals sp.Id
                                               where up.UserId == dep_user.Id && up.GrantType == "GROUP"
                                               select sp.Id;

                    var sitePermissions = from up in _depDbContext.UserPermissions
                                          join sp in _depDbContext.SitePermissions on up.PermissionGrantId equals sp.Id
                                          where up.UserId == dep_user.Id && up.GrantType == "ITEM"
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
                        user.Permissions[p.PermissionName] = true;
                    }
                }
            }

            return user;
        }

        [HttpGet]
        [Route("detail/{userId}")]
        public dynamic GetUserDetail(Guid userId)
        {
            var dep_user = _depDbContext.Users.Where(x => x.Id == userId).FirstOrDefault();
            if (dep_user == null)
            {
                throw new ApiException("Not Found", 404);
            }

            return dep_user;
        }

        [HttpPost]
        [Route("create")]
        public Guid Create([FromBody] User model)
        {
            var username = AppUser.ParseUsername(User.Identity.Name).Username;
            var user = _depDbContext.Users.FirstOrDefault(x => x.Username == username);

            var dep_user = new User();
            dep_user.Id = Guid.NewGuid();
            dep_user.Username = model.Username;
            dep_user.Employer = model.Employer;
            dep_user.Vendor = model.Vendor;
            dep_user.AutoEmail = model.AutoEmail;
            dep_user.Division = model.Division;
            dep_user.Comments = "ACTIVE";
            dep_user.Email = model.Email;
            dep_user.Phone = model.Phone;

            var role = _depDbContext.SiteRoles.FirstOrDefault(x => x.RoleName == "Users");
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

        [HttpPut]
        [Route("update/{userId}")]
        public Guid Update(Guid userId, [FromBody] User model)
        {
            var dep_user = _depDbContext.Users.FirstOrDefault(u => u.Id == userId);
            if (dep_user == null)
            {
                throw new ApiException("Not Found", 404);
            }

            dep_user.Username = model.Username;
            dep_user.Employer = model.Employer;
            dep_user.Vendor = model.Vendor;
            dep_user.AutoEmail = model.AutoEmail;
            dep_user.Division = model.Division;
            dep_user.Comments = "ACTIVE";
            dep_user.Email = model.Email;
            dep_user.Phone = model.Phone;

            _depDbContext.SaveChanges();

            return dep_user.Id;
        }

        [HttpGet]
        [Route("{userId}/permissions")]
        public List<AppRolePermission> Permissions(Guid userId)
        {
            var userPermissions = from up in _depDbContext.UserPermissions
                                  where up.UserId == userId && up.GrantType == "ITEM"
                                  select up;

            var query = from sp in _depDbContext.SitePermissions
                        join p in userPermissions on sp.Id equals p.PermissionGrantId into ups
                        from up in ups.DefaultIfEmpty()
                        select new AppRolePermission()
                        {
                            Id = sp.Id,
                            PermissionName = sp.PermissionName,
                            PermissionDescription = sp.PermissionDescription,
                            Category = sp.Category,
                            Selected = up != null
                        };

            return query.ToList();
        }

        [HttpPost]
        [Route("{userId}/permissions")]
        public bool UpdatePermissions(Guid userId, [FromBody] UserPermissions model)
        {
            var username = AppUser.ParseUsername(User.Identity.Name).Username;
            var currentUserId = _depDbContext.Users.FirstOrDefault(x => x.Username == username).Id;

            _depDbContext.UserPermissions
                .Where(p => p.UserId == userId)
                .Where(p => p.GrantType == "ITEM")
                .ToList()
                .ForEach(p => _depDbContext.UserPermissions.Remove(p));

            foreach (var p in model.Permissions)
            {
                if (p.Selected)
                {
                    var permission = new UserPermission()
                    {
                        GrantType = "ITEM",
                        UserId = userId,
                        PermissionGrantId = p.Id,
                        CreatedBy = currentUserId,
                        CreatedDate = DateTime.UtcNow
                    };
                    _depDbContext.UserPermissions.Add(permission);
                }
            }
            _depDbContext.SaveChanges();

            return true;
        }

        [HttpGet]
        [Route("{userId}/roles")]
        public dynamic UserRoles(Guid userId)
        {
            var userPermissions = from up in _depDbContext.UserPermissions
                                  where up.UserId == userId && up.GrantType == "GROUP"
                                  select up;

            var query = from sr in _depDbContext.SiteRoles
                        join p in userPermissions on sr.Id equals p.PermissionGrantId into ups
                        from up in ups.DefaultIfEmpty()
                        select new
                        {
                            Id = sr.Id,
                            RoleName = sr.RoleName,
                            RoleDescription = sr.RoleDescription,
                            Selected = up != null
                        };

            return query.ToList();
        }

        [HttpPost]
        [Route("{userId}/roles")]
        public bool UpdateUserRoles(Guid userId, [FromBody] UserPermissions model)
        {
            var username = AppUser.ParseUsername(User.Identity.Name).Username;
            var currentUserId = _depDbContext.Users.FirstOrDefault(x => x.Username == username).Id;

            _depDbContext.UserPermissions
                .Where(p => p.UserId == userId)
                .Where(p => p.GrantType == "GROUP")
                .ToList()
                .ForEach(p => _depDbContext.UserPermissions.Remove(p));

            foreach (var r in model.Permissions)
            {
                if (r.Selected)
                {
                    var permission = new UserPermission()
                    {
                        GrantType = "GROUP",
                        UserId = userId,
                        PermissionGrantId = r.Id,
                        CreatedBy = currentUserId,
                        CreatedDate = DateTime.UtcNow
                    };
                    _depDbContext.UserPermissions.Add(permission);
                }
            }
            _depDbContext.SaveChanges();

            return true;
        }
    }
}
