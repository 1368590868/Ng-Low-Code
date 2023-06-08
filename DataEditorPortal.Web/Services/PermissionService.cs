using AutoMapper;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Models;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;

namespace DataEditorPortal.Web.Services
{
    public interface IPermissionService
    {
        List<PermissionNode> GetPermissionTree(List<AppRolePermission> permissions, bool isAdmin = false);
    }

    public class PermissionService : IPermissionService
    {
        private readonly DepDbContext _depDbContext;
        private readonly ILogger<PermissionService> _logger;
        private readonly IMapper _mapper;

        public PermissionService(
            DepDbContext depDbContext,
            ILogger<PermissionService> logger,
            IMapper mapper)
        {
            _depDbContext = depDbContext;
            _logger = logger;
            _mapper = mapper;
        }

        public List<PermissionNode> GetPermissionTree(List<AppRolePermission> permissions, bool isAdmin = false)
        {
            #region get the menu structure in tree view

            var menus = (from m in _depDbContext.SiteMenus where m.Type != "System" select m).ToList();

            var permissionNodes = menus
                .Where(x => x.ParentId == null)
                .OrderBy(x => x.Order)
                .ThenBy(x => x.Name)
                .Select(x =>
                {
                    var items = GetChildren(menus, x.Id, !isAdmin);

                    return new PermissionNode
                    {
                        Label = x.Label,
                        Key = x.Id,
                        Name = x.Name,
                        Icon = x.Icon,
                        Description = x.Description,
                        Type = x.Type,
                        Selectable = !isAdmin,
                        Children = items.Any() ? items : null
                    };
                })
                .Where(x => x.Type != "Folder" || (x.Children != null && x.Children.Any()))
                .ToList();

            #endregion

            permissionNodes.ForEach(x =>
            {
                SetPortalItemPermissions(x, permissions, isAdmin);
            });

            return permissionNodes;
        }

        private List<PermissionNode> GetChildren(List<SiteMenu> menus, System.Guid parentId, bool selectable)
        {
            return menus
                .Where(m => m.ParentId == parentId)
                .OrderBy(x => x.Order)
                .ThenBy(x => x.Name)
                .Select(m =>
                {
                    var items = GetChildren(menus, m.Id, selectable);

                    return new PermissionNode
                    {
                        Label = m.Label,
                        Key = m.Id,
                        Name = m.Name,
                        Icon = m.Icon,
                        Description = m.Description,
                        Type = m.Type,
                        Selectable = selectable,
                        Children = items.Any() ? items : null
                    };
                })
                .ToList();
        }

        private void SetPortalItemPermissions(PermissionNode node, List<AppRolePermission> rolePermissions, bool isAdmin)
        {
            var types = new List<string> { "View", "Add", "Edit", "Delete", "Export" };
            var permissionNames = types.Select(t => $"{t}_{ node.Name.Replace("-", "_") }".ToUpper());

            if (node.Children != null)
            {
                node.Children.ForEach(x =>
                {
                    SetPortalItemPermissions(x, rolePermissions, isAdmin);
                });

                // it is portal item, but it has children, it must be linked table.
                if (node.Type == "Portal Item")
                {
                    var permission = rolePermissions
                    .Where(p => permissionNames.Contains(p.PermissionName))
                    .Select(x => new PermissionNode
                    {
                        Label = x.PermissionDescription,
                        Key = x.Id,
                        Name = x.PermissionName,
                        Description = x.PermissionDescription,
                        Selected = x.Selected,
                        Selectable = !isAdmin
                    })
                    .ToList();

                    node.Children.ForEach(x => permission.AddRange(x.Children));
                    node.Children = permission;
                }
            }
            else
            {
                node.Children = rolePermissions
                    .Where(p => permissionNames.Contains(p.PermissionName))
                    .Select(x => new PermissionNode
                    {
                        Label = x.PermissionDescription,
                        Key = x.Id,
                        Name = x.PermissionName,
                        Description = x.PermissionDescription,
                        Selected = x.Selected,
                        Selectable = !isAdmin
                    })
                    .ToList();
            }

            node.Selected = node.Children.All(n => n.Selected);
            if (!node.Selected)
                node.PartialSelected = node.Children.Any(n => n.Selected || n.PartialSelected);
            node.Expanded = !string.IsNullOrEmpty(node.Type);
        }

    }
}
