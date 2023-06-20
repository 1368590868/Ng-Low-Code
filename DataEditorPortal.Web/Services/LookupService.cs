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
                ConnectionName = item.DataSourceConnectionName,
                Name = item.Name
            };
        }

        public Guid Create(LookupItem model)
        {
            if (string.IsNullOrEmpty(model.Name) || string.IsNullOrEmpty(model.QueryText) || string.IsNullOrEmpty(model.ConnectionName))
                throw new ArgumentNullException();

            ValidateLookupItem(model);

            var configId = (from s in _depDbContext.SiteMenus
                            join u in _depDbContext.UniversalGridConfigurations on s.Name equals u.Name
                            where s.Id == model.PortalItemId
                            select u.Id).FirstOrDefault();

            var item = new Lookup()
            {
                Name = model.Name,
                QueryText = model.QueryText,
                DataSourceConnectionName = model.ConnectionName,
                UniversalGridConfigurationId = configId
            };
            _depDbContext.Lookups.Add(item);
            _depDbContext.SaveChanges();

            return item.Id;
        }

        public Guid Update(Guid id, LookupItem model)
        {
            if (string.IsNullOrEmpty(model.Name) || string.IsNullOrEmpty(model.QueryText) || string.IsNullOrEmpty(model.ConnectionName))
                throw new ArgumentNullException();

            var item = _depDbContext.Lookups.FirstOrDefault(x => x.Id == id);
            if (item == null)
            {
                throw new ApiException("Not Found", 404);
            }

            ValidateLookupItem(model);

            item.Name = model.Name;
            item.QueryText = model.QueryText;
            item.DataSourceConnectionName = model.ConnectionName;

            var configId = (from s in _depDbContext.SiteMenus
                            join u in _depDbContext.UniversalGridConfigurations on s.Name equals u.Name
                            where s.Id == model.PortalItemId
                            select u.Id).FirstOrDefault();

            item.UniversalGridConfigurationId = configId;

            _depDbContext.SaveChanges();

            return item.Id;
        }

        private void ValidateLookupItem(LookupItem model)
        {
            #region validate connection and query text
            try
            {
                var connection = _depDbContext.DataSourceConnections.FirstOrDefault(x => x.Name == model.ConnectionName);
                var query = _queryBuilder.ProcessQueryWithParamters(model.QueryText, new Dictionary<string, object>());

                using (var con = _serviceProvider.GetRequiredService<IDbConnection>())
                {
                    con.ConnectionString = connection.ConnectionString;
                    con.QueryFirst<DropdownOptionsItem>(query.Item1, query.Item2);
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

                using (var con = _serviceProvider.GetRequiredService<IDbConnection>())
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
