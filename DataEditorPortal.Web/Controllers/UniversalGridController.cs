using AutoWrapper.Filters;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Models;
using DataEditorPortal.Web.Models.UniversalGrid;
using DataEditorPortal.Web.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace DataEditorPortal.Web.Controllers
{
    [Authorize]
    [ApiController]
    [Route("/api/universal-grid")]
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
        [Route("{name}/config/column/filter-options")]
        public List<DropdownOptionsItem> GetGridColumnFilterOptions(string name, [FromQuery] string column)
        {
            if (string.IsNullOrEmpty(column))
                throw new DepException("Column can not be empty.");

            return _universalGridService.GetGridColumnFilterOptions(name, column);
        }

        [HttpGet]
        [Route("{name}/config/search")]
        public List<SearchFieldConfig> GridSearch(string name)
        {
            return _universalGridService.GetGridSearchConfig(name);
        }

        [HttpGet]
        [Route("{name}/config/detail")]
        public List<FormFieldConfig> GridDetail(string name, [FromQuery] string type)
        {
            return _universalGridService.GetGridDetailConfig(name, type);
        }

        [HttpPost]
        [Route("{name}/data")]
        public GridData FetchData(string name, GridParam gridParam)
        {
            return _universalGridService.GetGridData(name, gridParam);
        }

        [HttpGet]
        [Route("{name}/data/{id}")]
        public IDictionary<string, object> FetchDataDetail(string name, string id)
        {
            return _universalGridService.GetGridDataDetail(name, id);
        }

        [HttpPut]
        [Route("{name}/data/create")]
        public bool AddData(string name, [FromBody] Dictionary<string, object> model)
        {
            return _universalGridService.AddGridData(name, model);
        }

        [HttpPost]
        [Route("{name}/data/{id}/update")]
        public bool UpdateData(string name, string id, [FromBody] Dictionary<string, object> model)
        {
            return _universalGridService.UpdateGridData(name, id, model);
        }

        [HttpDelete]
        [Route("{name}/data/{id}/delete")]
        public bool DeleteData(string name, string id)
        {
            return _universalGridService.DeleteGridData(name, new string[] { id });
        }

        [HttpPost]
        [Route("{name}/data/batch-delete")]
        public bool BatchDeleteData(string name, [FromBody] JsonDocument model)
        {
            var ids = model.RootElement
                .GetProperty("ids")
                .EnumerateArray()
                .Select(x => x.GetString())
                .ToArray();
            return _universalGridService.DeleteGridData(name, ids);
        }

        [HttpPost]
        [Route("{name}/data/export")]
        [AutoWrapIgnore]
        public IActionResult ExportData(string name, [FromBody] ExportParam exportParam)
        {
            var fs = _universalGridService.ExportExcel(name, exportParam);

            return File(fs, "application/ms-excel", exportParam.FileName);
        }
    }
}
