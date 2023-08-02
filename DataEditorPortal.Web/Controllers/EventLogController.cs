using DataEditorPortal.Data.Common;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Models;
using DataEditorPortal.Web.Models.UniversalGrid;
using DataEditorPortal.Web.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;

namespace DataEditorPortal.Web.Controllers
{
    [ApiController]
    [Route("api/event-log")]
    public class EventLogController : ControllerBase
    {
        private readonly ILogger<EventLogController> _logger;
        private readonly DepDbContext _depDbContext;
        private readonly IQueryBuilder _queryBuilder;
        private readonly IUniversalGridService _universalGridService;
        private readonly IEventLogService _eventLogService;

        public EventLogController(
            ILogger<EventLogController> logger,
            DepDbContext depDbContext,
            IConfiguration config,
            IQueryBuilder queryBuilder,
            IUniversalGridService universalGridService,
            IEventLogService eventLogService)
        {
            _logger = logger;
            _depDbContext = depDbContext;
            _queryBuilder = queryBuilder;
            _universalGridService = universalGridService;
            _eventLogService = eventLogService;
        }

        [HttpPost]
        [Route("list")]
        public GridData GetEventLogs([FromBody] GridParam param)
        {
            var dataSourceConfig = new DataSourceConfig()
            {
                Columns = new List<string> { "ID", "EVENT_TIME", "EVENT_SECTION", "CATEGORY", "EVENT_NAME", "USERNAME" },
                TableSchema = Constants.DEFAULT_SCHEMA,
                TableName = "EVENT_LOGS",
                IdColumn = "ID"
            };
            var queryText = _queryBuilder.GenerateSqlTextForList(dataSourceConfig);
            queryText = _queryBuilder.UseFilters(queryText, param.Filters);
            queryText = _queryBuilder.UseSearches(queryText);

            if (param.IndexCount > 0)
            {
                if (!param.Sorts.Any()) param.Sorts = new List<SortParam>() { new SortParam { field = "EVENT_TIME", order = 0 } };
                queryText = _queryBuilder.UsePagination(queryText, param.StartIndex, param.IndexCount, param.Sorts);
            }
            else
            {
                queryText = _queryBuilder.UseOrderBy(queryText, param.Sorts);
            }

            var output = new GridData();
            var filtersApplied = _universalGridService.ProcessFilterParam(param.Filters, new List<FilterParam>());
            var keyValues = filtersApplied.Select(x => new KeyValuePair<string, object>($"{x.field}_{x.index}", x.value));
            var queryParams = _queryBuilder.GenerateDynamicParameter(keyValues);

            using (var con = _depDbContext.Database.GetDbConnection())
            {
                output = _universalGridService.QueryGridData(con, queryText, queryParams, "event-logs", false);
            }

            return output;
        }

        [HttpGet]
        [Route("{id}")]
        public EventLog GetEventLog(Guid id)
        {
            var item = _depDbContext.EventLogs.FirstOrDefault(x => x.Id == id);
            if (item == null)
            {
                throw new DepException("Not Found", 404);
            }

            return item;

        }

        [HttpPost]
        [Route("create")]
        public Guid Create(EventLog model)
        {
            model.Id = Guid.NewGuid();
            _depDbContext.EventLogs.Add(model);
            _depDbContext.SaveChanges();

            return model.Id;
        }

        [HttpDelete]
        [Route("{id}/delete")]
        public bool Delete(Guid id)
        {
            var item = _depDbContext.EventLogs.FirstOrDefault(x => x.Id == id);
            if (item == null)
            {
                throw new DepException("Not Found", 404);
            }

            _depDbContext.EventLogs.Remove(item);
            _depDbContext.SaveChanges();

            return true;
        }

        [HttpPost]
        [Route("page-request")]
        public void AddPageRequestLog([FromBody] EventLogModel model)
        {
            _eventLogService.AddPageRequestLog(model);
        }
    }
}
