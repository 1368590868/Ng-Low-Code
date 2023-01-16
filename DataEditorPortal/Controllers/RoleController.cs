using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;

namespace DataEditorPortal.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoleController : ControllerBase
    {
        private readonly ILogger<UserController> _logger;
        private readonly DepDbContext _depDbContext;

        public RoleController(ILogger<UserController> logger, DepDbContext depDbContext)
        {
            _logger = logger;
            _depDbContext = depDbContext;
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
                    var permission = new SitePermissionRole()
                    {
                        SiteRoleId = siteRole.Id,
                        SitePermissionId = p.Id,
                        CreatedBy = userId,
                        CreatedDate = DateTime.UtcNow
                    };
                    _depDbContext.SitePermissionRoles.Add(permission);
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

            _depDbContext.SitePermissionRoles
                .Where(r => r.SiteRoleId == roleId)
                .ToList()
                .ForEach(r => _depDbContext.SitePermissionRoles.Remove(r));

            foreach (var p in role.Permissions)
            {
                if (p.Selected)
                {
                    var permission = new SitePermissionRole()
                    {
                        SiteRoleId = siteRole.Id,
                        SitePermissionId = p.Id,
                        CreatedBy = userId,
                        CreatedDate = DateTime.UtcNow
                    };
                    _depDbContext.SitePermissionRoles.Add(permission);
                }
            }
            _depDbContext.SaveChanges();

            return siteRole.Id;
        }

        [HttpGet]
        [Route("{roleId}/permissions")]
        public List<AppRolePermission> PermissionsForRole(Guid roleId)
        {
            var sitePermissions = from sp in _depDbContext.SitePermissionRoles
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
                            Selected = rp != null
                        };

            return query.ToList();
        }

        //[HttpGet]
        //[Route("all-site-permissions")]
        //public List<AppRolePermission> AllSitePermission()
        //{
        //    var query = from p in _depDbContext.SitePermissions
        //                select new AppRolePermission()
        //                {
        //                    Id = p.Id,
        //                    PermissionName = p.PermissionName,
        //                    PermissionDescription = p.PermissionDescription,
        //                    Category = p.Category
        //                };

        //    return query.ToList();
        //}
    }
}
