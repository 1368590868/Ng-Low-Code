using AutoMapper;
using AutoWrapper.Wrappers;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Models.PortalItem;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace DataEditorPortal.Web.Controllers
{
    [ApiController]
    [Route("api/portal-item")]
    public class PortalItemController : ControllerBase
    {
        private readonly ILogger<PortalItemController> _logger;
        private readonly DepDbContext _depDbContext;
        private readonly IConfiguration _config;
        private readonly IMapper _mapper;

        public PortalItemController(
            ILogger<PortalItemController> logger,
            DepDbContext depDbContext,
            IConfiguration config,
            IMapper mapper)
        {
            _logger = logger;
            _depDbContext = depDbContext;
            _config = config;
            _mapper = mapper;
        }

        [HttpGet]
        [Route("list")]
        public IEnumerable<PortalItem> List()
        {
            var menus = _depDbContext.SiteMenus.ToList();

            var root = menus
                .Where(x => x.ParentId == null)
                .OrderBy(x => x.Order)
                .ThenBy(x => x.Name)
                .Select(x =>
                {
                    var children = menus
                            .Where(m => m.ParentId == x.Id)
                            .OrderBy(x => x.Order)
                            .ThenBy(x => x.Name)
                            .Select(m => new PortalItem()
                            {
                                Data = _mapper.Map<PortalItemData>(m)
                            })
                            .ToList();

                    return new PortalItem()
                    {
                        Data = _mapper.Map<PortalItemData>(x),
                        Children = children.Any() ? children : null
                    };
                });

            return root;
        }

        [HttpPost]
        [Route("folder/create")]
        public Guid CreateFolder([FromBody] PortalItemData model)
        {
            var siteMenu = _mapper.Map<SiteMenu>(model);
            siteMenu.Status = Data.Common.PortalItemStatus.Draft;
            siteMenu.ParentId = null;
            siteMenu.Type = "Folder";

            _depDbContext.SiteMenus.Add(siteMenu);
            _depDbContext.SaveChanges();

            return siteMenu.Id;
        }

        [HttpPut]
        [Route("folder/{id}/update")]
        public Guid UpdateFolder(Guid id, [FromBody] PortalItemData model)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new ApiException("Not Found", 404);
            }

            _mapper.Map<PortalItemData, SiteMenu>(model, siteMenu);
            //siteMenu.Status = Data.Common.PortalItemStatus.Draft;
            siteMenu.ParentId = null;
            siteMenu.Type = "Folder";

            _depDbContext.SaveChanges();

            return siteMenu.Id;
        }

        [HttpPut]
        [Route("{id}/publish")]
        public Guid Publish(Guid id)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new ApiException("Not Found", 404);
            }
            siteMenu.Status = Data.Common.PortalItemStatus.Published;

            _depDbContext.SaveChanges();

            return siteMenu.Id;
        }

        [HttpPut]
        [Route("{id}/unpublish")]
        public Guid UnPublish(Guid id)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new ApiException("Not Found", 404);
            }
            siteMenu.Status = Data.Common.PortalItemStatus.UnPublished;

            _depDbContext.SaveChanges();

            return siteMenu.Id;
        }

        [HttpPost]
        [Route("create")]
        public IActionResult Create(string name, [FromBody] object model)
        {
            return null;
        }

        [HttpPut]
        [Route("{id}/search/update")]
        public IActionResult UpdateSearch(Guid id, [FromBody] object model)
        {
            var item = _depDbContext.UniversalGridConfigurations.Where(x => x.Name == id.ToString()).FirstOrDefault();
            if (item == null) throw new System.Exception($"Portal Item with name:{id} deosn't exists");

            item.SearchConfig = JsonSerializer.Serialize(model);
            _depDbContext.SaveChanges();

            return new JsonResult(model);
        }
    }
}
