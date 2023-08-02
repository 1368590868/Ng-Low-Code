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
    [Route("api/site-group")]
    public class SiteGroupController : ControllerBase
    {
        private readonly ILogger<SiteGroupController> _logger;
        private readonly DepDbContext _depDbContext;
        private readonly IQueryBuilder _queryBuilder;
        private readonly IUniversalGridService _universalGridService;
        private readonly IPortalItemService _portalItemService;

        public SiteGroupController(
            ILogger<SiteGroupController> logger,
            DepDbContext depDbContext,
            IConfiguration config,
            IQueryBuilder queryBuilder,
            IUniversalGridService universalGridService,
            IPortalItemService portalItemService)
        {
            _logger = logger;
            _depDbContext = depDbContext;
            _queryBuilder = queryBuilder;
            _universalGridService = universalGridService;
            _portalItemService = portalItemService;
        }

        [HttpPost]
        [Route("list")]
        public GridData GetList([FromBody] GridParam param)
        {
            var dataSourceConfig = new DataSourceConfig()
            {
                TableSchema = Constants.DEFAULT_SCHEMA,
                TableName = "SITE_GROUPS",
                IdColumn = "ID"
            };
            var queryText = _queryBuilder.GenerateSqlTextForList(dataSourceConfig);

            var filtersApplied = _universalGridService.ProcessFilterParam(param.Filters, new List<FilterParam>());
            queryText = _queryBuilder.UseFilters(queryText, param.Filters);
            queryText = _queryBuilder.UseSearches(queryText);

            if (param.IndexCount > 0)
            {
                if (!param.Sorts.Any()) param.Sorts = new List<SortParam>() { new SortParam { field = "TITLE", order = 1 } };
                queryText = _queryBuilder.UsePagination(queryText, param.StartIndex, param.IndexCount, param.Sorts);
            }
            else
            {
                queryText = _queryBuilder.UseOrderBy(queryText, param.Sorts);
            }

            var output = new GridData();
            var keyValues = filtersApplied.Select(x => new KeyValuePair<string, object>($"{x.field}_{x.index}", x.value));
            var queryParams = _queryBuilder.GenerateDynamicParameter(keyValues);

            using (var con = _depDbContext.Database.GetDbConnection())
            {
                output = _universalGridService.QueryGridData(con, queryText, queryParams, "site-groups", false);
            }

            return output;
        }

        [HttpGet]
        [Route("{id}")]
        public SiteGroupModel GetDetail(Guid id)
        {
            var item = _depDbContext.SiteGroups.FirstOrDefault(x => x.Id == id);
            if (item == null)
            {
                throw new DepException("Not Found", 404);
            }

            var model = new SiteGroupModel()
            {
                Name = item.Name,
                Description = item.Description,
                Title = item.Title
            };

            var aboutSiteContent = _depDbContext.SiteContents.FirstOrDefault(x => x.SiteGroupId.Value == id && x.ContentName == "about");
            if (aboutSiteContent != null) model.AboutPageContent = aboutSiteContent.Content;

            var contactSiteContent = _depDbContext.SiteContents.FirstOrDefault(x => x.SiteGroupId.Value == id && x.ContentName == "contact");
            if (contactSiteContent != null) model.ContactPageContent = contactSiteContent.Content;

            return model;
        }

        [HttpGet]
        [Route("name-exists")]
        public bool ExistName([FromQuery] string name, [FromQuery] Guid? id)
        {
            if (string.IsNullOrEmpty(name)) return true;

            return _portalItemService.ExistName(name, id);
        }


        [HttpGet]
        [Route("get-code-name")]
        public string GetCodeNamme([FromQuery] string name)
        {
            return _portalItemService.GetCodeName(name);
        }

        [HttpPost]
        [Route("create")]
        public Guid Create(SiteGroupModel model)
        {
            if (string.IsNullOrEmpty(model.Title)) throw new DepException("Title cannot be empty.");

            if (string.IsNullOrEmpty(model.Name))
                model.Name = _portalItemService.GetCodeName(model.Title);

            if (_portalItemService.ExistName(model.Name, null)) throw new DepException("Name does already exist.");

            var item = new SiteGroup();
            item.Id = Guid.NewGuid();
            item.Name = model.Name;
            item.Title = model.Title;
            item.Description = model.Description;
            _depDbContext.SiteGroups.Add(item);

            var aboutSiteContent = new SiteContent();
            aboutSiteContent.Content = model.AboutPageContent;
            aboutSiteContent.ContentName = "about";
            aboutSiteContent.SiteGroupId = item.Id;
            _depDbContext.SiteContents.Add(aboutSiteContent);

            var contactSiteContent = new SiteContent();
            contactSiteContent.Content = model.ContactPageContent;
            contactSiteContent.ContentName = "contact";
            contactSiteContent.SiteGroupId = item.Id;
            _depDbContext.SiteContents.Add(contactSiteContent);

            _depDbContext.SaveChanges();

            return item.Id;
        }

        [HttpPut]
        [Route("{id}/update")]
        public Guid Update(Guid id, SiteGroupModel model)
        {
            if (string.IsNullOrEmpty(model.Title)) throw new DepException("Title cannot be empty.");

            if (string.IsNullOrEmpty(model.Name))
                model.Name = _portalItemService.GetCodeName(model.Title);

            if (_portalItemService.ExistName(model.Name, id)) throw new DepException("Name does exist.");

            var item = _depDbContext.SiteGroups.FirstOrDefault(x => x.Id == id);
            if (item == null)
            {
                throw new DepException("Not Found", 404);
            }

            item.Name = model.Name;
            item.Title = model.Title;
            item.Description = model.Description;

            var aboutSiteContent = _depDbContext.SiteContents.FirstOrDefault(x => x.SiteGroupId.Value == id && x.ContentName == "about");
            if (aboutSiteContent != null) aboutSiteContent.Content = model.AboutPageContent;

            var contactSiteContent = _depDbContext.SiteContents.FirstOrDefault(x => x.SiteGroupId.Value == id && x.ContentName == "contact");
            if (contactSiteContent != null) contactSiteContent.Content = model.ContactPageContent;

            _depDbContext.SaveChanges();

            return item.Id;
        }

        [HttpDelete]
        [Route("{id}/delete")]
        public bool Delete(Guid id)
        {
            var item = _depDbContext.SiteGroups.FirstOrDefault(x => x.Id == id);
            if (item == null)
            {
                throw new DepException("Not Found", 404);
            }

            _depDbContext.SiteContents.Where(x => x.SiteGroupId.Value == id).ToList().ForEach(x => _depDbContext.Remove(x));

            _depDbContext.SiteGroups.Remove(item);
            _depDbContext.SaveChanges();

            return true;
        }
    }
}
