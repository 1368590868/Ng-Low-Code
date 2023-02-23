using AutoMapper;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Web.Models;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;

namespace DataEditorPortal.Web.Services
{
    public interface IPermissionService
    {
        List<PermissionNode> GetPermissionTree(List<AppRolePermission> permissions);
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

        public List<PermissionNode> GetPermissionTree(List<AppRolePermission> permissions)
        {
            #region get the menu structure in tree view

            var menus = (from m in _depDbContext.SiteMenus where m.Type != "System" select m).ToList();

            var permissionNodes = menus
                .Where(x => x.ParentId == null)
                .OrderBy(x => x.Order)
                .ThenBy(x => x.Name)
                .Select(x =>
                {
                    var items = menus
                            .Where(m => m.ParentId == x.Id)
                            .OrderBy(x => x.Order)
                            .ThenBy(x => x.Name)
                            .Select(m => new PermissionNode
                            {
                                Label = m.Label,
                                Key = m.Id,
                                Name = m.Name,
                                Icon = m.Icon,
                                Description = m.Description,
                                Type = m.Type
                            })
                            .ToList();

                    return new PermissionNode
                    {
                        Label = x.Label,
                        Key = x.Id,
                        Name = x.Name,
                        Icon = x.Icon,
                        Description = x.Description,
                        Type = x.Type,
                        Children = items.Any() ? items : null
                    };
                })
                .Where(x => x.Type == "Portal Item" || (x.Children != null && x.Children.Any(c => c.Type == "Portal Item")))
                .ToList();

            #endregion

            permissionNodes.ForEach(x =>
            {
                SetPortalItemPermissions(x, permissions);
            });

            return permissionNodes;
        }

        private void SetPortalItemPermissions(PermissionNode node, List<AppRolePermission> rolePermissions)
        {
            if (node.Children != null)
            {
                node.Children.ForEach(x =>
                {
                    SetPortalItemPermissions(x, rolePermissions);
                });
            }
            else
            {
                node.Children = rolePermissions
                    .Where(p => p.PermissionName.Contains($"_{ node.Name.Replace("-", "_") }".ToUpper()))
                    .Select(x => new PermissionNode
                    {
                        Label = x.PermissionDescription,
                        Key = x.Id,
                        Name = x.PermissionName,
                        Description = x.PermissionDescription,
                        Selected = x.Selected
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
