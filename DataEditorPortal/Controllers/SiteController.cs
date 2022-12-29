using DataEditorPortal.Data.Contexts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.IO;
using System.Reflection;

namespace DataEditorPortal.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SiteController : ControllerBase
    {
        private readonly ILogger<UserController> _logger;
        private readonly DepDbContext _depDbContext;
        private readonly IConfiguration _config;

        public SiteController(ILogger<UserController> logger, DepDbContext depDbContext, IConfiguration config)
        {
            _logger = logger;
            _depDbContext = depDbContext;
            _config = config;
        }

        [HttpGet]
        [Route("environment")]
        [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
        public IActionResult GetEnvironment()
        {
            var section = _config.GetSection("SiteEvnironment");
            if (section == null) return null;

            return new JsonResult(new
            {
                WebHeaderMessage = section.GetValue<string>("WebHeaderMessage"),
                WebHeaderDescription = section.GetValue<string>("WebHeaderDescription")
            });
        }

        [HttpGet]
        [Route("version")]
        [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
        public IActionResult GetSiteVersion()
        {
            string version = Assembly.GetExecutingAssembly().GetName().Version.ToString();

            var filePath = Assembly.GetExecutingAssembly().Location;
            var date = new FileInfo(filePath).LastWriteTime.ToShortDateString();

            return new JsonResult(new
            {
                version,
                date
            });
        }
    }
}
