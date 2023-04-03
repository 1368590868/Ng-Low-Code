using AutoWrapper.Wrappers;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Common.License;
using DataEditorPortal.Web.Models;
using DataEditorPortal.Web.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.Linq;
using System.Reflection;

namespace DataEditorPortal.Web.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SiteController : ControllerBase
    {
        private readonly ILogger<SiteController> _logger;
        private readonly DepDbContext _depDbContext;
        private readonly IConfiguration _config;
        private readonly IUserService _userService;
        private readonly ILicenseService _licenseService;

        public SiteController(
            ILogger<SiteController> logger,
            DepDbContext depDbContext,
            IConfiguration config,
            IUserService userService,
            ILicenseService licenseService)
        {
            _logger = logger;
            _depDbContext = depDbContext;
            _config = config;
            _userService = userService;
            _licenseService = licenseService;
        }

        #region site settings

        [HttpGet]
        [Route("settings")]
        [AllowAnonymous]
        [NoLicenseCheck]
        [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
        public dynamic GetSettings()
        {
            var section = _config.GetSection("SiteEvnironment");
            if (section == null) return null;

            var setting = _depDbContext.SiteSettings.FirstOrDefault();
            if (setting == null)
            {
                setting = new SiteSetting();
                setting.SiteName = "Data Portal Editor";
                _depDbContext.SiteSettings.Add(setting);
                _depDbContext.SaveChanges();
            }

            return new
            {
                WebHeaderMessage = section.GetValue<string>("WebHeaderMessage"),
                WebHeaderDescription = section.GetValue<string>("WebHeaderDescription"),
                siteName = setting.SiteName,
                siteLogo = setting.SiteLogo
            };
        }

        [HttpPost]
        [Route("settings")]
        public bool UpdateSettings([FromBody] SiteSetting model)
        {
            var setting = _depDbContext.SiteSettings.FirstOrDefault();
            if (setting == null)
            {
                setting = new SiteSetting();
                _depDbContext.SiteSettings.Add(setting);
            }

            setting.SiteName = model.SiteName;
            setting.SiteLogo = model.SiteLogo;

            _depDbContext.SaveChanges();
            return true;
        }

        [HttpGet]
        [Route("version")]
        [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
        public dynamic GetSiteVersion()
        {
            string version = Assembly.GetExecutingAssembly().GetName().Version.ToString();

            var filePath = Assembly.GetExecutingAssembly().Location;
            var date = new FileInfo(filePath).LastWriteTime.ToShortDateString();

            return new
            {
                version,
                date
            };
        }

        #endregion

        [HttpPost]
        [Route("menus")]
        [NoLicenseCheck]
        public dynamic GetMenus()
        {
            var username = AppUser.ParseUsername(User.Identity.Name).Username;
            var isAdmin = _userService.IsAdmin(username);
            var userPermissions = _userService.GetUserPermissions().Keys;

            //var menus = _depDbContext.SiteMenus.ToList();
            var menus = (from m in _depDbContext.SiteMenus
                         join u in _depDbContext.UniversalGridConfigurations on m.Name equals u.Name into us
                         from u in us.DefaultIfEmpty()
                         where m.Type != "Sub Portal Item" && (u == null || u.ConfigCompleted)
                         select m).ToList();

            var root = menus
                .Where(x =>
                {
                    if (isAdmin) return x.ParentId == null;
                    else
                    {
                        return x.Status == Data.Common.PortalItemStatus.Published
                            && x.ParentId == null
                            && (x.Type == "Folder" || userPermissions.Contains($"VIEW_{ x.Name.Replace("-", "_") }".ToUpper()));
                    }
                })
                .OrderBy(x => x.Order)
                .ThenBy(x => x.Name)
                .Select(x =>
                {
                    var items = menus
                            .Where(m =>
                            {
                                if (isAdmin) return m.ParentId == x.Id;
                                else
                                {
                                    return m.Status == Data.Common.PortalItemStatus.Published
                                        && m.ParentId == x.Id
                                        && userPermissions.Contains($"VIEW_{ m.Name.Replace("-", "_") }".ToUpper());
                                }
                            })
                            .OrderBy(x => x.Order)
                            .ThenBy(x => x.Name)
                            .Select(m => new
                            {
                                id = m.Id,
                                name = m.Name,
                                label = m.Label,
                                icon = m.Icon,
                                description = m.Description,
                                type = m.Type,
                                link = m.Link,
                                status = m.Status
                            });

                    return new
                    {
                        id = x.Id,
                        name = x.Name,
                        label = x.Label,
                        icon = x.Icon,
                        description = x.Description,
                        items = items.Any() ? items : null,
                        type = x.Type,
                        link = x.Link,
                        status = x.Status
                    };
                })
                .Where(x => x.type != "Folder" || x.items != null);

            return root;
        }

        #region site content

        [HttpGet]
        [Route("content/{contentName}")]
        [AllowAnonymous]
        [NoLicenseCheck]
        public string GetSiteContent(string contentName)
        {
            var item = _depDbContext.SiteContents.FirstOrDefault(x => x.ContentName == contentName);
            if (item == null)
            {
                throw new ApiException("Not Found", 404);
            }

            return item.Content;
        }

        [HttpPost]
        [Route("content/{contentName}")]
        public bool UpdateSiteContent(string contentName, [FromBody] SiteContent siteContent)
        {
            var item = _depDbContext.SiteContents.FirstOrDefault(x => x.ContentName == contentName);
            if (item == null)
            {
                throw new ApiException("Not Found", 404);
            }

            item.Content = siteContent.Content;
            _depDbContext.SaveChanges();

            return true;
        }

        #endregion

        #region license

        [HttpGet]
        [Route("license")]
        [NoLicenseCheck]
        public dynamic GetSiteLicense()
        {
            var license = _licenseService.GetLicense();
            return new
            {
                license = license,
                isExpired = _licenseService.IsExpired(license)
            };
        }

        [HttpPost]
        [NoLicenseCheck]
        [Route("license")]
        public bool UpdateSiteLicense([FromBody] SiteSetting setting)
        {
            var item = _depDbContext.SiteContents.FirstOrDefault();
            if (item == null)
            {
                throw new ApiException("Not Found", 404);
            }

            _licenseService.SetLicense(setting.License);

            return true;
        }

        #endregion
    }
}
