using AutoWrapper.Wrappers;
using Dapper;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Models;
using DataEditorPortal.Web.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace DataEditorPortal.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LookupController : ControllerBase
    {
        private readonly ILogger<LookupController> _logger;
        private readonly DepDbContext _depDbContext;
        private readonly IConfiguration _config;
        private readonly IDbSqlBuilder _dbSqlBuilder;

        public LookupController(ILogger<LookupController> logger, DepDbContext depDbContext, IConfiguration config, IDbSqlBuilder dbSqlBuilder)
        {
            _logger = logger;
            _depDbContext = depDbContext;
            _config = config;
            _dbSqlBuilder = dbSqlBuilder;
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
        public Lookup GetLookup(Guid id)
        {
            var item = _depDbContext.Lookups.FirstOrDefault(x => x.Id == id);
            if (item == null)
            {
                throw new ApiException("Not Found", 404);
            }

            return item;
        }

        [HttpPost]
        [Route("create")]
        public Guid Create(LookupItem model)
        {
            var item = new Lookup()
            {
                Name = model.Name,
                QueryText = model.QueryText
            };
            _depDbContext.Lookups.Add(item);
            _depDbContext.SaveChanges();

            return item.Id;
        }

        [HttpPut]
        [Route("{id}/update")]
        public Guid Update(Guid id, LookupItem model)
        {
            var item = _depDbContext.Lookups.FirstOrDefault(x => x.Id == id);
            if (item == null)
            {
                throw new ApiException("Not Found", 404);
            }

            item.Name = model.Name;
            item.QueryText = model.QueryText;

            _depDbContext.SaveChanges();

            return item.Id;
        }

        [HttpPost]
        [Route("{id}/options")]
        public List<DropdownOptionsItem> GetLookup(Guid id, [FromBody] Dictionary<string, JsonElement> model)
        {
            var lookup = _depDbContext.Lookups.Find(id);

            var result = new List<DropdownOptionsItem>();

            if (lookup != null)
            {
                // replace paramters in query text.

                var query = DataHelper.ProcessQueryWithParamters(lookup.QueryText, model);

                using (var con = _depDbContext.Database.GetDbConnection())
                {
                    result = con.Query<DropdownOptionsItem>(query.Item1, query.Item2).ToList();
                }
            }

            return result;
        }
    }
}
