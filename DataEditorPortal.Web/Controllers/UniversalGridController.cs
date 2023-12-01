using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Models;
using DataEditorPortal.Web.Models.UniversalGrid;
using DataEditorPortal.Web.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
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
        private readonly DepDbContext _depDbContext;
        private readonly ICurrentUserAccessor _currentUserAccessor;

        public UniversalGridController(
            ILogger<UniversalGridController> logger,
            IUniversalGridService universalGridService,
            DepDbContext depDbContext,
            ICurrentUserAccessor currentUserAccessor)
        {
            _logger = logger;
            _universalGridService = universalGridService;
            _depDbContext = depDbContext;
            _currentUserAccessor = currentUserAccessor;
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
        [Route("{name}/grids-with-same-config")]
        public List<DropdownOptionsItem> GetGridWithSameSearchConfig(string name)
        {
            return _universalGridService.GetGridWithSameSearchConfig(name);
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

        [HttpGet]
        [Route("{name}/data/{id}/update-histories")]
        public List<DataUpdateHistory> GetDataUpdateHistories(string name, string id)
        {
            return _universalGridService.GetDataUpdateHistories(name, id);
        }

        [HttpPost]
        [Route("{name}/data/batch-get")]
        public IDictionary<string, object> BatchGet(string name, [FromBody] BatchGetInput input)
        {
            if (input == null || input.Ids == null || input.Ids.Length == 0) throw new ArgumentNullException("input.Ids");

            return _universalGridService.BatchGet(name, input.Ids);
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

        [HttpPost]
        [Route("{name}/data/batch-update")]
        public bool BatchUpdate(string name, [FromBody] BatchUpdateInput model)
        {
            if (model == null || model.Ids == null || model.Ids.Length == 0) throw new ArgumentNullException("model.Ids");
            if (model == null || model.Data == null || model.Data.Keys.Count == 0) throw new ArgumentNullException("model.Data");

            return _universalGridService.BatchUpdate(name, model.Ids, model.Data);
        }

        [HttpDelete]
        [Route("{name}/data/{id}/delete")]
        public bool DeleteData(string name, object id)
        {
            return _universalGridService.DeleteGridData(name, new object[] { id });
        }

        [HttpPost]
        [Route("{name}/data/batch-delete")]
        public bool BatchDeleteData(string name, [FromBody] BatchDeleteParam param)
        {
            return _universalGridService.DeleteGridData(name, param.Ids);
        }

        [HttpPost]
        [Route("{name}/data/export")]
        public IActionResult ExportData(string name, [FromBody] ExportParam exportParam)
        {
            exportParam.IndexCount = 0;
            var fs = _universalGridService.ExportExcel(name, exportParam);

            return File(fs, "application/ms-excel", exportParam.FileName);
        }

        // Saved Search API

        [HttpGet]
        [Route("{name}/saved-search/list")]
        public List<SavedSearchModel> GetSavedSearch(string name)
        {
            var config = _universalGridService.GetUniversalGridConfiguration(name);
            var userId = _currentUserAccessor.CurrentUser.UserId();

            var result = _depDbContext.SavedSearches.Where(x => x.UserId == userId && x.UniversalGridConfigurationId == config.Id)
                .ToList()
                .Select(x =>
                     new SavedSearchModel
                     {
                         Id = x.Id,
                         Name = x.Name,
                         Searches = JsonSerializer.Deserialize<Dictionary<string, object>>(x.SearchParams)
                     }
                ).ToList();

            return result;
        }


        [HttpPost]
        [Route("{name}/saved-search/create")]
        public Guid CreateSavedSearch(string name, [FromBody] SavedSearchModel model)
        {
            if (string.IsNullOrEmpty(model.Name)) throw new DepException("Name cannot be empty.");
            if (model.Searches == null) throw new DepException("Searches cannot be empty.");

            var config = _universalGridService.GetUniversalGridConfiguration(name);
            var userId = _currentUserAccessor.CurrentUser.UserId();

            var item = new SavedSearch()
            {
                Name = model.Name,
                UserId = userId,
                SearchParams = JsonSerializer.Serialize(model.Searches),
                UniversalGridConfigurationId = config.Id
            };
            _depDbContext.SavedSearches.Add(item);
            _depDbContext.SaveChanges();

            return item.Id;
        }

        [HttpPut]
        [Route("{name}/saved-search/{id}/update")]
        public Guid UpdateSavedSearch(string name, Guid id, [FromBody] SavedSearchModel model)
        {
            if (string.IsNullOrEmpty(model.Name)) throw new DepException("Name cannot be empty.");
            if (model.Searches == null) throw new DepException("Searches cannot be empty.");

            var config = _universalGridService.GetUniversalGridConfiguration(name);
            var userId = _currentUserAccessor.CurrentUser.UserId();

            var item = _depDbContext.SavedSearches.FirstOrDefault(x => x.Id == id && x.UserId == userId && x.UniversalGridConfigurationId == config.Id);
            if (item == null) throw new DepException("Saved Search does not exist.", 404);

            item.Name = model.Name;
            item.SearchParams = JsonSerializer.Serialize(model.Searches);

            _depDbContext.SaveChanges();

            return item.Id;
        }

        // Link Data API

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
        public GridData GetLinkedTableDataForFieldControl(string table1Name, GridParam gridParam)
        {
            return _universalGridService.GetGridDataForFieldControl(table1Name, gridParam);
        }

        [HttpPost]
        [Route("{table1Name}/linked-table-editor/table-config")]
        public dynamic GetLinkedTableConfigForFieldControl(string table1Name)
        {
            return _universalGridService.GetRelationConfigForFieldControl(table1Name);
        }
    }
}
