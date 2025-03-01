﻿using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Common.License;
using DataEditorPortal.Web.Models;
using DataEditorPortal.Web.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.RegularExpressions;

namespace DataEditorPortal.Web.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly ILogger<UserController> _logger;
        private readonly DepDbContext _depDbContext;
        private readonly IUserService _userService;
        private readonly IPermissionService _permissionService;
        private readonly ICurrentUserAccessor _currentUserAccessor;

        public UserController(
            ILogger<UserController> logger,
            DepDbContext depDbContext,
            IUserService userService,
            IPermissionService permissionService,
            ICurrentUserAccessor currentUserAccessor)
        {
            _logger = logger;
            _depDbContext = depDbContext;
            _userService = userService;
            _permissionService = permissionService;
            _currentUserAccessor = currentUserAccessor;
        }

        [HttpGet]
        [NoLicenseCheck]
        [Route("getLoggedInUser")]
        public AppUser GetLoggedInUser([FromQuery] string url)
        {
            var user = AppUser.FromClaimsPrincipal(User);

            var dep_user = _depDbContext.Users.Where(x => x.Username == user.Username).FirstOrDefault();
            if (dep_user == null)
            {
                dep_user = new Data.Models.User();
                dep_user.Username = user.Username;
                dep_user.Name = user.DisplayName;
                dep_user.AutoEmail = true;

                // check site has admin
                if (_userService.HasAdmin())
                {
                    dep_user.Id = _userService.CreateUser(dep_user);
                }
                else
                {
                    dep_user.Id = _userService.CreateUser(dep_user, new List<string>() { "Administrators" });
                }
            }

            user.Id = dep_user.Id;
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
                user.Permissions = _userService.GetUserPermissions();

                // get the group from the return url
                var group = string.Empty;
                if (!string.IsNullOrEmpty(url))
                {
                    Match match = Regex.Match(url, @"^/([^/]+)(?:/[^/]+)*/*$");
                    if (match.Success)
                    {
                        group = match.Groups[1].Value;
                    }
                }

                user.UserMenus = _userService.GetUserMenus(user.Username, group);
            }
            user.IsAdmin = _userService.IsAdmin(user.Username);

            return user;
        }

        [HttpGet]
        [AdminAuthorizationFilter]
        [Route("username-exists")]
        public bool ExistName([FromQuery] string username, [FromQuery] Guid? id)
        {
            return _depDbContext.Users.Where(x => x.Username.ToUpper() == username.ToUpper() && x.Id != id).Any();
        }

        [HttpGet]
        [Route("email-exists")]
        public bool ExistEmail([FromQuery] string email, [FromQuery] Guid? id)
        {
            return _depDbContext.Users.Where(x => x.Email == email && x.Id != id).Any();
        }

        [HttpGet]
        [Route("detail/{userId}")]
        public dynamic GetUserDetail(Guid userId)
        {
            var dep_user = _depDbContext.Users.Where(x => x.Id == userId).FirstOrDefault();
            if (dep_user == null)
            {
                throw new DepException("Not Found", 404);
            }
            else
            {
                var username = _currentUserAccessor.CurrentUser.Username();
                if (dep_user.Username != username && !_userService.IsAdmin(username))
                {
                    throw new DepException("Not Found", 404);
                }
            }

            return dep_user;
        }

        [HttpPost]
        [AdminAuthorizationFilter]
        [Route("create")]
        public Guid Create([FromBody] User model)
        {
            return _userService.CreateUser(model);
        }

        [HttpPut]
        [Route("update/{userId}")]
        public Guid Update(Guid userId, [FromBody] User model)
        {
            var dep_user = _depDbContext.Users.FirstOrDefault(u => u.Id == userId);
            if (dep_user == null)
            {
                throw new DepException("Not Found", 404);
            }
            else
            {
                var username = _currentUserAccessor.CurrentUser.Username();
                if (dep_user.Username != username && !_userService.IsAdmin(username))
                {
                    throw new DepException("Not Found", 404);
                }
            }

            dep_user.Username = model.Username;
            dep_user.Employer = model.Employer;
            dep_user.Vendor = model.Vendor;
            dep_user.AutoEmail = model.AutoEmail;
            dep_user.Comments = "ACTIVE";
            dep_user.Email = model.Email;
            dep_user.Phone = model.Phone;
            dep_user.Name = model.Name;

            _depDbContext.SaveChanges();

            return dep_user.Id;
        }

        [HttpGet]
        [AdminAuthorizationFilter]
        [Route("{userId}/permissions")]
        public List<PermissionNode> Permissions(Guid userId)
        {
            var userPermissions = from up in _depDbContext.UserPermissions
                                  where up.UserId == userId && up.GrantType == "ITEM"
                                  select up;

            var query = from sp in _depDbContext.SitePermissions
                        join p in userPermissions on sp.Id equals p.PermissionGrantId into ups
                        from up in ups.DefaultIfEmpty()
                        orderby sp.Category, sp.PermissionName
                        select new AppRolePermission()
                        {
                            Id = sp.Id,
                            PermissionName = sp.PermissionName,
                            PermissionDescription = sp.PermissionDescription,
                            Category = sp.Category,
                            Selected = up != null
                        };

            return _permissionService.GetPermissionTree(query.ToList());
        }

        [HttpPost]
        [AdminAuthorizationFilter]
        [Route("{userId}/permissions")]
        public bool UpdatePermissions(Guid userId, [FromBody] UserPermissions model)
        {
            var currentUserId = _currentUserAccessor.CurrentUser.UserId();

            _depDbContext.UserPermissions
                .Where(p => p.UserId == userId)
                .Where(p => p.GrantType == "ITEM")
                .ToList()
                .ForEach(p => _depDbContext.UserPermissions.Remove(p));

            model.Permissions.Where(p => p.Selected).Select(p => p.Id).Distinct().ToList().ForEach(id =>
            {
                var permission = new UserPermission()
                {
                    GrantType = "ITEM",
                    UserId = userId,
                    PermissionGrantId = id,
                    CreatedBy = currentUserId,
                    CreatedDate = DateTime.UtcNow
                };
                _depDbContext.UserPermissions.Add(permission);
            });

            _depDbContext.SaveChanges();

            return true;
        }

        [HttpGet]
        [AdminAuthorizationFilter]
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
        [AdminAuthorizationFilter]
        [Route("{userId}/roles")]
        public bool UpdateUserRoles(Guid userId, [FromBody] UserPermissions model)
        {
            var currentUserId = _currentUserAccessor.CurrentUser.UserId();

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

            _userService.ClearUserCache(userId);

            return true;
        }
    }
}
