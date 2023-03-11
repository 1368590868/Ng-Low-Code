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
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data.Common;
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
        private readonly IQueryBuilder _queryBuilder;
        private readonly IServiceProvider _serviceProvider;

        public LookupController(
            ILogger<LookupController> logger,
            DepDbContext depDbContext,
            IConfiguration config,
            IQueryBuilder queryBuilder,
            IServiceProvider serviceProvider)
        {
            _logger = logger;
            _depDbContext = depDbContext;
            _config = config;
            _queryBuilder = queryBuilder;
            _serviceProvider = serviceProvider;
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
            var item = _depDbContext.Lookups.FirstOrDefault(x => x.Id == id);
            if (item == null)
            {
                throw new ApiException("Not Found", 404);
            }

            return new LookupItem()
            {
                Id = item.Id,
                QueryText = item.QueryText,
                ConnectionId = item.DataSourceConnectionId,
                Name = item.Name
            };
        }

        [HttpPost]
        [Route("create")]
        public Guid Create(LookupItem model)
        {
            if (string.IsNullOrEmpty(model.Name) || string.IsNullOrEmpty(model.QueryText) || model.ConnectionId == Guid.Empty)
                throw new ArgumentNullException();

            ValidateLookupItem(model);

            var item = new Lookup()
            {
                Name = model.Name,
                QueryText = model.QueryText,
                DataSourceConnectionId = model.ConnectionId
            };
            _depDbContext.Lookups.Add(item);
            _depDbContext.SaveChanges();

            return item.Id;
        }

        [HttpPut]
        [Route("{id}/update")]
        public Guid Update(Guid id, LookupItem model)
        {
            if (string.IsNullOrEmpty(model.Name) || string.IsNullOrEmpty(model.QueryText) || model.ConnectionId == Guid.Empty)
                throw new ArgumentNullException();

            var item = _depDbContext.Lookups.FirstOrDefault(x => x.Id == id);
            if (item == null)
            {
                throw new ApiException("Not Found", 404);
            }

            ValidateLookupItem(model);

            item.Name = model.Name;
            item.QueryText = model.QueryText;
            item.DataSourceConnectionId = model.ConnectionId;

            _depDbContext.SaveChanges();

            return item.Id;
        }

        private void ValidateLookupItem(LookupItem model)
        {
            #region validate connection and query text
            try
            {
                var connection = _depDbContext.DataSourceConnections.FirstOrDefault(x => x.Id == model.ConnectionId);
                var query = DataHelper.ProcessQueryWithParamters(model.QueryText, new Dictionary<string, JsonElement>());

                using (var con = _serviceProvider.GetRequiredService<DbConnection>())
                {
                    con.ConnectionString = connection.ConnectionString;
                    con.Query<DropdownOptionsItem>(query.Item1, query.Item2).ToList();
                }
            }
            catch (Exception ex)
            {
                throw new DepException(ex.Message);
            }
            #endregion
        }

        [HttpPost]
        [Route("{id}/options")]
        public List<DropdownOptionsItem> GetLookup(Guid id, [FromBody] Dictionary<string, JsonElement> model)
        {
            var lookup = _depDbContext.Lookups.Include(x => x.DataSourceConnection).FirstOrDefault(x => x.Id == id);

            var result = new List<DropdownOptionsItem>();

            if (lookup != null)
            {
                // replace paramters in query text.

                var query = DataHelper.ProcessQueryWithParamters(lookup.QueryText, model);

                using (var con = _serviceProvider.GetRequiredService<DbConnection>())
                {
                    con.ConnectionString = lookup.DataSourceConnection.ConnectionString;
                    result = con.Query<DropdownOptionsItem>(query.Item1, query.Item2).ToList();
                }
            }

            return result;
        }
    }
}
