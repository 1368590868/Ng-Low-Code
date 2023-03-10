using AutoWrapper.Wrappers;
using DataEditorPortal.Data.Common;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
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
    [Route("api/[controller]")]
    public class DictionaryController : ControllerBase
    {
        private readonly ILogger<DictionaryController> _logger;
        private readonly DepDbContext _depDbContext;
        private readonly IDbSqlBuilder _dbSqlBuilder;
        private readonly IUniversalGridService _universalGridService;

        public DictionaryController(
            ILogger<DictionaryController> logger,
            DepDbContext depDbContext,
            IConfiguration config,
            IDbSqlBuilder dbSqlBuilder,
            IUniversalGridService universalGridService)
        {
            _logger = logger;
            _depDbContext = depDbContext;
            _dbSqlBuilder = dbSqlBuilder;
            _universalGridService = universalGridService;
        }

        [HttpPost]
        [Route("list")]
        public GridData GetDictionaries([FromBody] GridParam param)
        {
            var dataSourceConfig = new DataSourceConfig()
            {
                TableSchema = Constants.DEFAULT_SCHEMA,
                TableName = "DataDictionaries"
            };
            var queryText = _dbSqlBuilder.GenerateSqlTextForList(dataSourceConfig);
            queryText = _dbSqlBuilder.UseFilters(queryText, param.Filters);
            queryText = _dbSqlBuilder.UseSearches(queryText);

            if (param.IndexCount > 0)
            {
                if (!param.Sorts.Any()) param.Sorts = new List<SortParam>() { new SortParam { field = "Category", order = 1 } };
                queryText = _dbSqlBuilder.UsePagination(queryText, param.StartIndex, param.IndexCount, param.Sorts);
            }
            else
            {
                queryText = _dbSqlBuilder.UseOrderBy(queryText, param.Sorts);
            }

            var output = new GridData();
            using (var con = _depDbContext.Database.GetDbConnection())
            {
                output = _universalGridService.QueryGridData(con, queryText);
            }

            return output;
        }

        [HttpGet]
        [Route("{id}")]
        public DataDictionary GetDataDictionary(Guid id)
        {
            var item = _depDbContext.DataDictionaries.FirstOrDefault(x => x.Id == id);
            if (item == null)
            {
                throw new ApiException("Not Found", 404);
            }

            return item;
        }

        [HttpPost]
        [Route("create")]
        public Guid Create(DataDictionary model)
        {
            model.Id = Guid.NewGuid();
            _depDbContext.DataDictionaries.Add(model);
            _depDbContext.SaveChanges();

            return model.Id;
        }

        [HttpPut]
        [Route("{id}/update")]
        public Guid Update(Guid id, DataDictionary model)
        {
            var item = _depDbContext.DataDictionaries.FirstOrDefault(x => x.Id == id);
            if (item == null)
            {
                throw new ApiException("Not Found", 404);
            }

            item.Label = model.Label;
            item.Value = model.Value;
            item.Value1 = model.Value1;
            item.Value2 = model.Value2;
            item.Category = model.Category;

            _depDbContext.SaveChanges();

            return item.Id;
        }

        [HttpDelete]
        [Route("{id}/delete")]
        public bool Delete(Guid id)
        {
            var item = _depDbContext.DataDictionaries.FirstOrDefault(x => x.Id == id);
            if (item == null)
            {
                throw new ApiException("Not Found", 404);
            }

            _depDbContext.DataDictionaries.Remove(item);
            _depDbContext.SaveChanges();

            return true;
        }
    }
}
