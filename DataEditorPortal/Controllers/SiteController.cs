using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
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

        public SiteController(ILogger<SiteController> logger, DepDbContext depDbContext, IConfiguration config)
        {
            _logger = logger;
            _depDbContext = depDbContext;
            _config = config;
        }

        [HttpGet]
        [Route("settings")]
        [AllowAnonymous]
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

        [HttpPost]
        [Route("menus")]
        public dynamic GetMenus()
        {
            var menus = _depDbContext.SiteMenus
                .Where(x => x.Status == Data.Common.PortalItemStatus.Published)
                .ToList();

            var root = menus
                .Where(x => x.ParentId == null)
                .OrderBy(x => x.Order)
                .ThenBy(x => x.Name)
                .Select(x =>
                {
                    var items = menus
                            .Where(m => m.ParentId == x.Id)
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
                                link = m.Link
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
                        link = x.Link
                    };
                });

            return root;
        }
    }
}
