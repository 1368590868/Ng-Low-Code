using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Models;
using DataEditorPortal.Web.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace DataEditorPortal.Web.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class LookupController : ControllerBase
    {
        private readonly ILogger<LookupController> _logger;
        private readonly DepDbContext _depDbContext;
        private readonly ILookupService _lookupService;

        public LookupController(
            ILogger<LookupController> logger,
            DepDbContext depDbContext,
            ILookupService lookupService)
        {
            _logger = logger;
            _depDbContext = depDbContext;
            _lookupService = lookupService;
        }

        [HttpGet]
        [Route("list")]
        public List<Lookup> GetLookups()
        {
            return _depDbContext.Lookups
                .Select(x => new Lookup() { Id = x.Id, Name = x.Name })
                .ToList();
        }

        [HttpGet]
        [Route("{id}")]
        public LookupItem GetLookup(Guid id)
        {
            return _lookupService.GetLookup(id);
        }

        [HttpPost]
        [Route("create")]
        public Guid Create(LookupItem model)
        {
            return _lookupService.Create(model);
        }

        [HttpPut]
        [Route("{id}/update")]
        public Guid Update(Guid id, LookupItem model)
        {
            return _lookupService.Update(id, model);
        }


        [HttpPost]
        [Route("{id}/options")]
        public List<DropdownOptionsItem> GetLookup(Guid id, [FromBody] Dictionary<string, object> model)
        {
            return _lookupService.GetLookups(id, model);
        }
    }
}
