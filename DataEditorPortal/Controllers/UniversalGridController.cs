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
        [Route("{name}/config/columns")]
        public IActionResult GridColumns(string name)
        {
            var columns = _universalGridService.GetGridColumnsConfig(name);
            return new JsonResult(columns);
        }

        [HttpGet]
        [Route("{name}/config/search")]
        public IActionResult GridSearch(string name)
        {
            var config = _universalGridService.GetGridSearchConfig(name);
            return new JsonResult(config);
        }

        [HttpGet]
        [Route("{name}/config/detail")]
        public IActionResult GridDetail(string name)
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
            return new JsonResult(columns);
        }

        [HttpPost]
        [Route("{name}/data")]
        public IActionResult FetchData(string name, GridParam gridParam)
        {
            var data = _universalGridService.GetGridData(name, gridParam);
            return new JsonResult(data);
        }

        [HttpGet]
        [Route("{name}/data/{id}")]
        public IActionResult FetchDataDetail(string name, GridParam gridParam)
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

        [HttpGet]
        [Route("{name}/data/create")]
        public IActionResult AddData(string name, GridParam gridParam)
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

        [HttpGet]
        [Route("{name}/data/{id}/update")]
        public IActionResult UpdateDate(string name, GridParam gridParam)
        {


            return new JsonResult(null);
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
