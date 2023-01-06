using DataEditorPortal.Data.Contexts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Linq;
using System.Text.Json;

namespace DataEditorPortal.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PortalItemController : ControllerBase
    {
        private readonly ILogger<UserController> _logger;
        private readonly DepDbContext _depDbContext;
        private readonly IConfiguration _config;

        public PortalItemController(ILogger<UserController> logger, DepDbContext depDbContext, IConfiguration config)
        {
            _logger = logger;
            _depDbContext = depDbContext;
            _config = config;
        }

        [HttpPost]
        [Route("{name}/create")]
        public IActionResult Create(string name, [FromBody] object model)
        {
            return null;
        }

        [HttpPost]
        [Route("{name}/search/update")]
        public IActionResult UpdateSearch(string name, [FromBody] object model)
        {
            var item = _depDbContext.UniversalGridConfigurations.Where(x => x.Name == name).FirstOrDefault();
            if (item == null) throw new System.Exception($"Portal Item with name:{name} deosn't exists");

            item.SearchConfig = JsonSerializer.Serialize(model);
            _depDbContext.SaveChanges();

            return new JsonResult(model);
        }
    }
}
