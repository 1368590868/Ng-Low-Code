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
        List<DataSourceTableColumn> GetDataSourceTableColumns(Guid id);
        DataSourceConfig GetDataSourceConfig(Guid id);
        bool SaveDataSourceConfig(Guid id, DataSourceConfig model);
        List<GridColConfig> GetGridColumnsConfig(Guid id);
        bool SaveGridColumnsConfig(Guid id, List<GridColConfig> model);
        List<SearchFieldConfig> GetGridSearchConfig(Guid id);
        bool SaveGridSearchConfig(Guid id, List<SearchFieldConfig> model);
        DetailConfig GetGridFormConfig(Guid id);
        bool SaveGridFormConfig(Guid id, DetailConfig model);
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

        public List<DataSourceTableColumn> GetDataSourceTableColumns(Guid id)
        {
            var datasourceConfig = GetDataSourceConfig(id);
            if (datasourceConfig == null)
                throw new DepException("DataSource Config is empty for Portal Item: " + id);

            return GetDataSourceTableColumns(datasourceConfig.TableSchema, datasourceConfig.TableName);
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

            return !string.IsNullOrEmpty(config.DataSourceConfig) ? JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig) : new DataSourceConfig();
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

            if (!string.IsNullOrEmpty(config.DataSourceConfig))
            {
                var dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);
                if (dataSourceConfig.TableSchema != model.TableSchema || dataSourceConfig.TableName != model.TableName)
                {
                    // data table changed, need  to clear columns, search and form configurations
                    config.ColumnsConfig = null;
                    config.SearchConfig = null;
                    config.DetailConfig = null;
                    config.ConfigCompleted = false;
                }
            }

            config.DataSourceConfig = JsonSerializer.Serialize(model);
            siteMenu.Status = Data.Common.PortalItemStatus.Draft;

            _depDbContext.SaveChanges();

            return true;
        }

        public List<GridColConfig> GetGridColumnsConfig(Guid id)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new ApiException("Not Found", 404);
            }

            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == siteMenu.Name);
            if (config == null) throw new Exception("Grid configuration does not exists with name: " + siteMenu.Name);

            if (!string.IsNullOrEmpty(config.ColumnsConfig))
            {
                return JsonSerializer.Deserialize<List<GridColConfig>>(config.ColumnsConfig);
            }
            else
            {
                var datasourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);
                var columns = GetDataSourceTableColumns(datasourceConfig.TableSchema, datasourceConfig.TableName);
                return columns.Select(x => new GridColConfig()
                {
                    field = x.ColumnName,
                    header = x.ColumnName,
                    width = "250px",
                    filterType = x.FilterType,
                    sortable = true
                }).ToList();
            }
        }

        public bool SaveGridColumnsConfig(Guid id, List<GridColConfig> model)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new ApiException("Not Found", 404);
            }

            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == siteMenu.Name);
            if (config == null) throw new Exception("Grid configuration does not exists with name: " + siteMenu.Name);

            config.ColumnsConfig = JsonSerializer.Serialize(model);
            siteMenu.Status = Data.Common.PortalItemStatus.Draft;

            _depDbContext.SaveChanges();

            return true;
        }

        public List<SearchFieldConfig> GetGridSearchConfig(Guid id)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new ApiException("Not Found", 404);
            }

            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == siteMenu.Name);
            if (config == null) throw new Exception("Grid configuration does not exists with name: " + siteMenu.Name);

            if (!string.IsNullOrEmpty(config.SearchConfig))
            {
                return JsonSerializer.Deserialize<List<SearchFieldConfig>>(config.SearchConfig);
            }
            else
            {
                return new List<SearchFieldConfig>();
            }
        }

        public bool SaveGridSearchConfig(Guid id, List<SearchFieldConfig> model)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new ApiException("Not Found", 404);
            }

            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == siteMenu.Name);
            if (config == null) throw new Exception("Grid configuration does not exists with name: " + siteMenu.Name);

            config.SearchConfig = JsonSerializer.Serialize(model);
            siteMenu.Status = Data.Common.PortalItemStatus.Draft;

            _depDbContext.SaveChanges();

            return true;
        }

        public DetailConfig GetGridFormConfig(Guid id)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new ApiException("Not Found", 404);
            }

            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == siteMenu.Name);
            if (config == null) throw new Exception("Grid configuration does not exists with name: " + siteMenu.Name);

            if (!string.IsNullOrEmpty(config.DetailConfig))
            {
                return JsonSerializer.Deserialize<DetailConfig>(config.DetailConfig);
            }
            else
            {
                return new DetailConfig();
            }
        }

        public bool SaveGridFormConfig(Guid id, DetailConfig model)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new ApiException("Not Found", 404);
            }

            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == siteMenu.Name);
            if (config == null) throw new Exception("Grid configuration does not exists with name: " + siteMenu.Name);

            config.DetailConfig = JsonSerializer.Serialize(model);
            config.ConfigCompleted = true;

            siteMenu.Status = Data.Common.PortalItemStatus.Draft;

            _depDbContext.SaveChanges();

            return true;
        }
    }
}
