using AutoMapper;
using AutoWrapper.Wrappers;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Models.PortalItem;
using DataEditorPortal.Web.Models.UniversalGrid;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Linq;
using System.Text.Json;

namespace DataEditorPortal.Web.Services
{
    public interface IPortalItemService
    {
        List<DataSourceTable> GetDataSourceTables();
        List<DataSourceTableColumn> GetDataSourceTableColumns(string tableSchema, string tableName);
        DataSourceConfig GetDataSourceConfig(Guid id);
        bool SaveDataSourceConfig(Guid id, DataSourceConfig model);
    }

    public class PortalItemService : IPortalItemService
    {
        private readonly DepDbContext _depDbContext;
        private readonly IDbSqlBuilder _dbSqlBuilder;
        private readonly ILogger<PortalItemService> _logger;
        private readonly IMapper _mapper;

        public PortalItemService(
            DepDbContext depDbContext,
            IDbSqlBuilder dbSqlBuilder,
            ILogger<PortalItemService> logger,
            IMapper mapper)
        {
            _depDbContext = depDbContext;
            _dbSqlBuilder = dbSqlBuilder;
            _logger = logger;
            _mapper = mapper;
        }

        public List<DataSourceTable> GetDataSourceTables()
        {
            var result = new List<DataSourceTable>();

            using (var con = _depDbContext.Database.GetDbConnection())
            {
                con.Open();
                var cmd = con.CreateCommand();
                cmd.Connection = con;

                cmd.CommandText = _dbSqlBuilder.GetSqlTextForDatabaseTables();

                try
                {
                    using (var dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            result.Add(new DataSourceTable()
                            {
                                TableName = dr[0].ToString(),
                                TableSchema = dr[1].ToString()
                            });
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.Message, ex);
                    throw new DepException("An Error in the query has occurred: " + ex.Message);
                }
            }

            return result;
        }

        public List<DataSourceTableColumn> GetDataSourceTableColumns(string tableSchema, string tableName)
        {
            var result = new List<DataSourceTableColumn>();

            using (var con = _depDbContext.Database.GetDbConnection())
            {
                con.Open();
                var cmd = con.CreateCommand();
                cmd.Connection = con;

                cmd.CommandText = _dbSqlBuilder.GetSqlTextForDatabaseTableSchema(tableSchema, tableName);
                try
                {
                    using (var dr = cmd.ExecuteReader(CommandBehavior.SchemaOnly | CommandBehavior.KeyInfo))
                    {
                        var schema = dr.GetColumnSchema();
                        result = schema.Select(x =>
                        {
                            return _mapper.Map<DataSourceTableColumn>(x);
                        }).ToList();
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.Message, ex);
                    throw new DepException("An Error in the query has occurred: " + ex.Message);
                }
            }

            return result;
        }

        public DataSourceConfig GetDataSourceConfig(Guid id)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new ApiException("Not Found", 404);
            }

            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == siteMenu.Name);
            if (config == null) throw new Exception("Grid configuration does not exists with name: " + siteMenu.Name);

            return JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);
        }

        public bool SaveDataSourceConfig(Guid id, DataSourceConfig model)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new ApiException("Not Found", 404);
            }

            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == siteMenu.Name);
            if (config == null) throw new Exception("Grid configuration does not exists with name: " + siteMenu.Name);

            config.DataSourceConfig = JsonSerializer.Serialize(model);
            _depDbContext.SaveChanges();

            return true;
        }
    }
}
