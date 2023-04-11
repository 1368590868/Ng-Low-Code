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
        [Route("{name}/config/form")]
        public List<FormFieldConfig> GridFormConfig(string name, [FromQuery] string type)
        {
            return _universalGridService.GetGridFormConfig(name, type);
        }

        [HttpGet]
        [Route("{name}/config/event")]
        public GridFormLayout GridEventConfig(string name, [FromQuery] string type)
        {
            return _universalGridService.GetFormEventConfig(name, type);
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

        [HttpPost]
        [Route("{name}/data/{type}/validate/{id?}")]
        public bool ValidateData(string name, string type, string id, [FromBody] Dictionary<string, object> model)
        {
            return _universalGridService.OnValidateGridData(name, type, id, model);
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
            exportParam.IndexCount = 0;
            var fs = _universalGridService.ExportExcel(name, exportParam);

            return File(fs, "application/ms-excel", exportParam.FileName);
        }

        [HttpGet]
        [Route("{name}/linked/grid-config")]
        public dynamic GetLinkedGridConfig(string name)
        {
            return _universalGridService.GetLinkedGridConfig(name);
        }

        [HttpGet]
        [Route("{table1Name}/linked/grid-data-ids")]
        public dynamic GetDataIdsByLinkedId(string table1Name, [FromQuery] string table2Id)
        {
            return _universalGridService.GetLinkedDataIdsForList(table1Name, table2Id);
        }

        [HttpPost]
        [Route("{table1Name}/linked-table-editor/table-data")]
        public GridData GetLinkedTableDataForFieldControl(string table1Name, [FromBody] Dictionary<string, object> searchParam)
        {
            return _universalGridService.GetLinkedTableDataForFieldControl(table1Name, searchParam);
        }

        [HttpPost]
        [Route("{table1Name}/linked-table-editor/table-config")]
        public dynamic GetLinkedTableConfigForFieldControl(string table1Name)
        {
            return _universalGridService.GetLinkedTableConfigForFieldControl(table1Name);
        }
    }
}
