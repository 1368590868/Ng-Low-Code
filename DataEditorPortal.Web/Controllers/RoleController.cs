using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Models;
using DataEditorPortal.Web.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;

namespace DataEditorPortal.Web.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class RoleController : ControllerBase
    {
        private readonly ILogger<RoleController> _logger;
        private readonly DepDbContext _depDbContext;
        private readonly IPermissionService _permissionService;

        public RoleController(
            ILogger<RoleController> logger,
            DepDbContext depDbContext,
            IPermissionService permissionService)
        {
            _logger = logger;
            _depDbContext = depDbContext;
            _permissionService = permissionService;
        }

        [HttpGet]
        [Route("list")]
        public List<SiteRole> List()
        {
            return _depDbContext.SiteRoles.OrderBy(x => x.RoleName).ToList();
        }

        [HttpPut]
        [Route("create")]
        public Guid Create([FromBody] AppRole role)
        {
            var username = AppUser.ParseUsername(User.Identity.Name).Username;
            var userId = _depDbContext.Users.FirstOrDefault(x => x.Username == username).Id;

            var siteRole = new SiteRole()
            {
                Id = Guid.NewGuid(),
                RoleName = role.RoleName,
                RoleDescription = role.RoleDescription
            };

            _depDbContext.SiteRoles.Add(siteRole);

            foreach (var p in role.Permissions)
            {
                if (p.Selected)
                {
                    var permission = new SiteRolePermission()
                    {
                        SiteRoleId = siteRole.Id,
                        SitePermissionId = p.Id,
                        CreatedBy = userId,
                        CreatedDate = DateTime.UtcNow
                    };
                    _depDbContext.SiteRolePermissions.Add(permission);
                }
            }
            _depDbContext.SaveChanges();

            return siteRole.Id;
        }

        [HttpPost]
        [Route("{roleId}/update")]
        public Guid Update(Guid roleId, [FromBody] AppRole role)
        {
            var username = AppUser.ParseUsername(User.Identity.Name).Username;
            var userId = _depDbContext.Users.FirstOrDefault(x => x.Username == username).Id;

            var siteRole = _depDbContext.SiteRoles.FirstOrDefault(r => r.Id == roleId);
            siteRole.RoleName = role.RoleName;
            siteRole.RoleDescription = role.RoleDescription;

            _depDbContext.SiteRolePermissions
                .Where(r => r.SiteRoleId == roleId)
                .ToList()
                .ForEach(r => _depDbContext.SiteRolePermissions.Remove(r));

            role.Permissions.Where(p => p.Selected).Select(p => p.Id).Distinct().ToList().ForEach(id =>
            {
                var permission = new SiteRolePermission()
                {
                    SiteRoleId = siteRole.Id,
                    SitePermissionId = id,
                    CreatedBy = userId,
                    CreatedDate = DateTime.UtcNow
                };
                _depDbContext.SiteRolePermissions.Add(permission);
            });

            _depDbContext.SaveChanges();

            return siteRole.Id;
        }

        [HttpGet]
        [Route("{roleId}/permissions")]
        public List<PermissionNode> PermissionsForRole(Guid roleId)
        {
            var isAdmin = _depDbContext.SiteRoles.Any(x => x.Id == roleId && x.RoleName == "Administrators");

            var sitePermissions = from sp in _depDbContext.SiteRolePermissions
                                  where sp.SiteRoleId == roleId
                                  select sp;

            var query = from sp in _depDbContext.SitePermissions
                        join p in sitePermissions on sp.Id equals p.SitePermissionId into rps
                        from rp in rps.DefaultIfEmpty()
                        orderby sp.Category, sp.PermissionName
                        select new AppRolePermission()
                        {
                            Id = sp.Id,
                            PermissionName = sp.PermissionName,
                            PermissionDescription = sp.PermissionDescription,
                            Category = sp.Category,
                            Selected = isAdmin || rp != null
                        };

            return _permissionService.GetPermissionTree(query.ToList(), isAdmin);
        }

        [HttpGet]
        [Route("all-site-permissions")]
        public List<PermissionNode> AllSitePermission()
        {
            var query = from p in _depDbContext.SitePermissions
                        orderby p.Category, p.PermissionName
                        select new AppRolePermission()
                        {
                            Id = p.Id,
                            PermissionName = p.PermissionName,
                            PermissionDescription = p.PermissionDescription,
                            Category = p.Category
                        };

            return _permissionService.GetPermissionTree(query.ToList());
        }
    }
}
