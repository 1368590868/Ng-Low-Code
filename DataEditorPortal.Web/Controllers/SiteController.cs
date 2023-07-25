using AutoMapper;
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
using System.Collections.Generic;
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
        private readonly IMapper _mapper;

        public SiteController(
            ILogger<SiteController> logger,
            DepDbContext depDbContext,
            IConfiguration config,
            IUserService userService,
            ILicenseService licenseService,
            IMapper mapper)
        {
            _logger = logger;
            _depDbContext = depDbContext;
            _config = config;
            _userService = userService;
            _licenseService = licenseService;
            _mapper = mapper;
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
                dbProvider = _config.GetValue<string>("DatabaseProvider"),
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

        [HttpGet]
        [Route("env")]
        [AllowAnonymous]
        [NoLicenseCheck]
        [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
        public dynamic GetSiteEnv()
        {
            var section = _config.GetSection("SiteEvnironment");
            if (section == null) return null;

            return new
            {
                WebHeaderMessage = section.GetValue<string>("WebHeaderMessage"),
                WebHeaderDescription = section.GetValue<string>("WebHeaderDescription")
            };
        }

        #endregion

        [HttpPost]
        [Route("menus")]
        [NoLicenseCheck]
        public List<MenuItem> GetMenus([FromQuery] string siteGroupName)
        {
            var user = AppUser.FromWindowsIdentity(User?.Identity);
            return _userService.GetUserMenus(user.Username, siteGroupName);
        }

        #region site content

        [HttpGet]
        [Route("content/{contentName}")]
        [AllowAnonymous]
        [NoLicenseCheck]
        public string GetSiteContent(string contentName, [FromQuery] Guid? siteGroup)
        {
            var item = _depDbContext.SiteContents.FirstOrDefault(x => x.ContentName == contentName && x.SiteGroupId == siteGroup);
            if (item == null)
            {
                throw new DepException("Not Found", 404);
            }

            return item.Content;
        }

        [HttpPost]
        [Route("content/{contentName}")]
        public bool UpdateSiteContent(string contentName, [FromBody] SiteContent siteContent)
        {
            var item = _depDbContext.SiteContents.FirstOrDefault(x => x.ContentName == contentName && x.SiteGroupId == null);
            if (item == null)
            {
                throw new DepException("Not Found", 404);
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
                throw new DepException("Not Found", 404);
            }

            _licenseService.SetLicense(setting.License);

            return true;
        }

        #endregion
    }
}
