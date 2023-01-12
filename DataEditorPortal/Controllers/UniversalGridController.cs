using DataEditorPortal.Web.Models.UniversalGrid;
using DataEditorPortal.Web.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;

namespace DataEditorPortal.Web.Controllers
{
    [ApiController]
    [Route("/api/[controller]")]
    public class UniversalGridController : ControllerBase
    {
        private readonly ILogger<UniversalGridController> _logger;
        private readonly IUniversalGridService _universalGridService;

        public UniversalGridController(
            ILogger<UniversalGridController> logger,
            IUniversalGridService universalGridService)
        {
            _logger = logger;
            _universalGridService = universalGridService;
        }

        [HttpGet]
        [Route("{name}/grid-config")]
        public GridConfig GridConfig(string name)
        {
            return _universalGridService.GetGridConfig(name);
        }

        [HttpGet]
        [Route("{name}/config/columns")]
        public List<GridColConfig> GridColumns(string name)
        {
            return _universalGridService.GetGridColumnsConfig(name);
        }

        [HttpGet]
        [Route("{name}/config/search")]
        public List<SearchFieldConfig> GridSearch(string name)
        {
            return _universalGridService.GetGridSearchConfig(name);
        }

        [HttpGet]
        [Route("{name}/config/detail")]
        public List<FormFieldConfig> GridDetail(string name)
        {
            return _universalGridService.GetGridDetailConfig(name);
        }

        [HttpPost]
        [Route("{name}/data")]
        public GridData FetchData(string name, GridParam gridParam)
        {
            return _universalGridService.GetGridData(name, gridParam);
        }

        [HttpGet]
        [Route("{name}/data/{id}")]
        public Dictionary<string, string> FetchDataDetail(string name, string id)
        {
            return _universalGridService.GetGridDataDetail(name, id);
        }

        [HttpGet]
        [Route("{name}/data/create")]
        public bool AddData(string name, Dictionary<string, object> model)
        {
            return _universalGridService.AddGridData(name, model);
        }

        [HttpGet]
        [Route("{name}/data/{id}/update")]
        public bool UpdateDate(string name, string id, Dictionary<string, object> model)
        {
            return _universalGridService.UpdateGridData(name, id, model);
        }

        [HttpGet]
        [Route("{name}/data/export")]
        public IActionResult ExportData(string name, GridParam gridParam)
        {
            var columns = new List<GridColConfig>() {
                new GridColConfig()
                {
                    field = "UserId",
                    header = "CNP ID",
                    width = "130px",
                    filterType = "text"
                },
                new GridColConfig()
                {
                    field = "Name",
                    header = "Name",
                    width = "250px",
                    filterType = "text"
                },new GridColConfig()
                {
                    field = "Email",
                    header = "Email",
                    width = "250px",
                    filterType = "text"
                },new GridColConfig()
                {
                    field = "Phone",
                    header = "Phone",
                    width = "250px",
                    filterType = "text"
                },new GridColConfig()
                {
                    field = "AutoEmail",
                    header = "Auto Email",
                    width = "250px",
                    filterType = "text"
                },new GridColConfig()
                {
                    field = "Vendor",
                    header = "Vendor",
                    width = "250px",
                    filterType = "text"
                },new GridColConfig()
                {
                    field = "Employer",
                    header = "Employer",
                    width = "250px",
                    filterType = "text"
                },new GridColConfig()
                {
                    field = "Division",
                    header = "Division",
                    width = "250px",
                    filterType = "text"
                },new GridColConfig()
                {
                    field = "Comments",
                    header = "Comments",
                    width = "250px",
                    filterType = "text"
                }
            };

            // _universalGridService.

            return new JsonResult(columns);
        }
    }
}
