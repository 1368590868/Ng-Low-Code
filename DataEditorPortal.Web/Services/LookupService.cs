using AutoWrapper.Wrappers;
using Dapper;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Linq;

namespace DataEditorPortal.Web.Services
{
    public interface ILookupService
    {
        LookupItem GetLookup(Guid id);
        Guid Create(LookupItem model);
        Guid Update(Guid id, LookupItem model);
        public List<DropdownOptionsItem> GetLookups(Guid id, Dictionary<string, object> model = null);
    }

    public class LookupService : ILookupService
    {
        private readonly ILogger<LookupService> _logger;
        private readonly DepDbContext _depDbContext;
        private readonly IQueryBuilder _queryBuilder;
        private readonly IServiceProvider _serviceProvider;

        public LookupService(
            ILogger<LookupService> logger,
            DepDbContext depDbContext,
            IQueryBuilder queryBuilder,
            IServiceProvider serviceProvider)
        {
            _logger = logger;
            _depDbContext = depDbContext;
            _queryBuilder = queryBuilder;
            _serviceProvider = serviceProvider;
        }

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
                var query = _queryBuilder.ProcessQueryWithParamters(model.QueryText, new Dictionary<string, object>());

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

        public List<DropdownOptionsItem> GetLookups(Guid id, Dictionary<string, object> model = null)
        {
            if (model == null) model = new Dictionary<string, object>();

            var lookup = _depDbContext.Lookups.Include(x => x.DataSourceConnection).FirstOrDefault(x => x.Id == id);

            var result = new List<DropdownOptionsItem>();

            if (lookup != null)
            {
                // replace paramters in query text.

                var query = _queryBuilder.ProcessQueryWithParamters(lookup.QueryText, model);

                using (var con = _serviceProvider.GetRequiredService<DbConnection>())
                {
                    con.ConnectionString = lookup.DataSourceConnection.ConnectionString;

                    DataTable schema;
                    using (var dr = con.ExecuteReader(query.Item1, query.Item2))
                    {
                        schema = dr.GetSchemaTable();
                    }

                    var data = con.Query(query.Item1, query.Item2).ToList();
                    data.ForEach(item =>
                    {
                        var values = ((IDictionary<string, object>)item).Select(x => x.Value).ToList();
                        var option = new DropdownOptionsItem();
                        for (var index = 0; index < values.Count; index++)
                        {
                            var value = values[index];
                            if (index == 0) option.Label = _queryBuilder.TransformValue(value, schema.Rows[index]);
                            if (index == 1) option.Value = _queryBuilder.TransformValue(value, schema.Rows[index]);
                            if (index == 2) option.Value1 = _queryBuilder.TransformValue(value, schema.Rows[index]);
                            if (index == 3) option.Value2 = _queryBuilder.TransformValue(value, schema.Rows[index]);
                        }
                        result.Add(option);
                    });
                }
            }

            return result;
        }
    }
}
