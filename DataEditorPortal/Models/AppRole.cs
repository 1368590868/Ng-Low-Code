using System;
using System.Collections.Generic;

namespace DataEditorPortal.Web.Models
{
    public class AppRole
    {
        public string RoleName { get; set; }
        public string RoleDescription { get; set; }

        public List<AppRolePermission> Permissions { get; set; }
    }

    public class AppRolePermission
    {
        public Guid Id { get; set; }
        public bool Selected { get; set; }
        public string PermissionName { get; set; }
        public string PermissionDescription { get; set; }
        public string Category { get; set; }
    }
}
