using AutoMapper;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;

namespace DataEditorPortal.Web.Services
{
    public interface IUserService
    {
        List<MenuItem> GetUserMenus(string username, string group);
        Dictionary<string, bool> GetUserPermissions();
        bool IsAdmin(string username);
        bool HasAdmin();
        Guid CreateUser(User model, List<string> roleNames = null);
        void ClearUserCache(Guid userId);
    }

    public class UserService : IUserService
    {
        private readonly DepDbContext _depDbContext;
        private readonly ILogger<UserService> _logger;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IMemoryCache _memoryCache;
        private readonly ICurrentUserAccessor _currentUserAccessor;

        public UserService(
            DepDbContext depDbContext,
            ILogger<UserService> logger,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor,
            IMemoryCache memoryCache,
            ICurrentUserAccessor currentUserAccessor)
        {
            _depDbContext = depDbContext;
            _logger = logger;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _memoryCache = memoryCache;
            _currentUserAccessor = currentUserAccessor;
        }

        public List<MenuItem> GetUserMenus(string username, string groupName)
        {
            var isAdmin = IsAdmin(username);
            var userPermissions = GetUserPermissions().Keys.ToList();

            // find site group
            SiteGroup siteGroup = null;
            if (!string.IsNullOrEmpty(groupName))
                siteGroup = _depDbContext.SiteGroups.FirstOrDefault(x => x.Name.ToUpper() == groupName.ToUpper());

            var groupPath = string.Empty;
            if (siteGroup != null) groupPath = siteGroup.Name;

            var menusQuery = from m in _depDbContext.SiteMenus select m;
            if (siteGroup != null)
            {
                menusQuery = from m in _depDbContext.SiteMenus
                             where
                                // all the root menus that in this group AND all the children menus.
                                m.ParentId != null || (m.ParentId == null && m.SiteGroups.Any(g => g.Id == siteGroup.Id))
                             select m;
            }

            var menus = (
                    from m in menusQuery
                    join u in _depDbContext.UniversalGridConfigurations on m.Name equals u.Name into us
                    from u in us.DefaultIfEmpty()
                    where m.Type != "Sub Portal Item" && (u == null || u.ConfigCompleted)
                    select new { m, itemType = u != null ? u.ItemType : null }
                )
                .ToList()
                .Select(x =>
                {
                    var item = _mapper.Map<MenuItem>(x.m);
                    item.ItemType = x.itemType;
                    return item;
                }).ToList();

            var menuItems = menus
                .Where(m =>
                {
                    if (isAdmin) return m.ParentId == null;
                    else
                    {
                        return m.Status == Data.Common.PortalItemStatus.Published
                            && m.ParentId == null
                            && (m.Type == "Folder" || userPermissions.Contains($"VIEW_{m.Name.Replace("-", "_")}".ToUpper()));
                    }
                })
                .Select(m =>
                {
                    var path = SetMenuLink(m, groupPath);
                    m.Items = GetChildrenItems(menus, m.Id, isAdmin, userPermissions, path);
                    return m;
                })
                .Where(m => m.Type != "Folder" || m.Items != null)
                .OrderBy(m => m.Order)
                .ThenBy(m => m.Name)
                .ToList();

            if (siteGroup != null)
            {
                menuItems = new List<MenuItem>() {
                    new MenuItem()
                    {
                        Name = siteGroup.Name,
                        Label = siteGroup.Title,
                        Description = siteGroup.Description,
                        Id = siteGroup.Id,
                        Component = "GroupLayoutComponent",
                        Type = "Group",
                        Items = menuItems
                    }
                };
            }

            return menuItems;
        }

        private List<MenuItem> GetChildrenItems(IEnumerable<MenuItem> menus, Guid parentId, bool isAdmin, List<string> userPermissions, string parentPath = "")
        {
            var menuItems = menus
                    .Where(m =>
                    {
                        if (isAdmin) return m.ParentId == parentId;
                        else
                        {
                            return m.Status == Data.Common.PortalItemStatus.Published
                                && m.ParentId == parentId
                                && (m.Type == "Folder" || userPermissions.Contains($"VIEW_{m.Name.Replace("-", "_")}".ToUpper()));
                        }
                    })
                    .Select(m =>
                    {
                        var path = SetMenuLink(m, parentPath);
                        m.Items = GetChildrenItems(menus, m.Id, isAdmin, userPermissions, path);
                        return m;
                    })
                    .Where(m => m.Type != "Folder" || m.Items != null)
                    .OrderBy(m => m.Order)
                    .ThenBy(m => m.Name)
                    .ToList();

            return menuItems.Any() ? menuItems : null;
        }

        private string SetMenuLink(MenuItem menu, string parentPath = "")
        {
            var path = string.IsNullOrEmpty(parentPath) ? menu.Name : $"{parentPath}/{menu.Name}";
            if (menu.Type == "Portal Item" || menu.Type == "System")
                menu.RouterLink = path;
            else if (menu.Type == "External")
                menu.Url = menu.Link;
            else
                menu.RouterLink = menu.Link;

            return path;
        }

        public Dictionary<string, bool> GetUserPermissions()
        {
            var result = new Dictionary<string, bool>();

            var username = _currentUserAccessor.CurrentUser.Username();
            var userEntity = _depDbContext.Users.FirstOrDefault(x => x.Username == username);
            var userId = userEntity != null ? userEntity.Id : Guid.Empty;

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
            var cacheKey = $"IsAdmin_{username}";

            return _memoryCache.GetOrCreate(cacheKey, entry =>
            {
                entry.SlidingExpiration = TimeSpan.FromMinutes(60); // Cache the result for 60 minutes

                var query = from u in _depDbContext.Users
                            join up in _depDbContext.UserPermissions on u.Id equals up.UserId
                            join sr in _depDbContext.SiteRoles on up.PermissionGrantId equals sr.Id
                            where up.GrantType == "GROUP" && u.Username == username && sr.RoleName == "Administrators"
                            select u.Id;

                return query.Any();
            });
        }

        public bool HasAdmin()
        {
            var query = from u in _depDbContext.Users
                        join up in _depDbContext.UserPermissions on u.Id equals up.UserId
                        join sr in _depDbContext.SiteRoles on up.PermissionGrantId equals sr.Id
                        where up.GrantType == "GROUP" && sr.RoleName == "Administrators"
                        select u.Id;
            return query.Any();
        }

        public Guid CreateUser(User model, List<string> roleNames = null)
        {
            var username = _currentUserAccessor.CurrentUser.Username();
            var user = _depDbContext.Users.FirstOrDefault(x => x.Username == username);

            var dep_user = new User();
            dep_user.Id = Guid.NewGuid();
            dep_user.Name = string.IsNullOrEmpty(model.Name) ? model.Username : model.Name;
            dep_user.Username = model.Username;
            dep_user.Employer = model.Employer;
            dep_user.Vendor = model.Vendor;
            dep_user.AutoEmail = model.AutoEmail;
            dep_user.Comments = "ACTIVE";
            dep_user.Email = model.Email;
            dep_user.Phone = model.Phone;

            if (roleNames == null) roleNames = new List<string>() { "Users" };
            if (!roleNames.Contains("Users")) roleNames.Add("Users");

            foreach (var roleName in roleNames)
            {
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
            }

            _depDbContext.Users.Add(dep_user);
            _depDbContext.SaveChanges();

            return dep_user.Id;
        }

        public void ClearUserCache(Guid userId)
        {
            var user = _depDbContext.Users.FirstOrDefault(x => x.Id == userId);
            if (user != null)
                _memoryCache.Remove($"IsAdmin_{user.Username}");
        }
    }
}
