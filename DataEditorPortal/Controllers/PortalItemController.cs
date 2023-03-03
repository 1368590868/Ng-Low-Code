using AutoMapper;
using AutoWrapper.Wrappers;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Models.PortalItem;
using DataEditorPortal.Web.Models.UniversalGrid;
using DataEditorPortal.Web.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq;

namespace DataEditorPortal.Web.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/portal-item")]
    public class PortalItemController : ControllerBase
    {
        private readonly ILogger<PortalItemController> _logger;
        private readonly DepDbContext _depDbContext;
        private readonly IConfiguration _config;
        private readonly IMapper _mapper;
        private readonly IPortalItemService _portalItemService;
        private readonly IDbSqlBuilder _dbSqlBuilder;
        private readonly IServiceProvider _serviceProvider;

        public PortalItemController(
            ILogger<PortalItemController> logger,
            DepDbContext depDbContext,
            IConfiguration config,
            IMapper mapper,
            IPortalItemService portalItemService,
            IDbSqlBuilder dbSqlBuilder,
            IServiceProvider serviceProvider)
        {
            _logger = logger;
            _depDbContext = depDbContext;
            _config = config;
            _mapper = mapper;
            _portalItemService = portalItemService;
            _dbSqlBuilder = dbSqlBuilder;
            _serviceProvider = serviceProvider;
        }

        [HttpGet]
        [Route("list")]
        public IEnumerable<PortalItem> List()
        {
            var query = from m in _depDbContext.SiteMenus
                        join p in _depDbContext.UniversalGridConfigurations on m.Name equals p.Name into mps
                        from mp in mps.DefaultIfEmpty()
                        select new
                        {
                            menu = m,
                            configCompleted = mp != null ? mp.ConfigCompleted : (bool?)null
                        };

            var menus = query.ToList();

            var root = menus
                .Where(x => x.menu.ParentId == null)
                .OrderBy(x => x.menu.Order)
                .ThenBy(x => x.menu.Name)
                .Select(x =>
                {
                    var children = menus
                            .Where(m => m.menu.ParentId == x.menu.Id)
                            .OrderBy(x => x.menu.Order)
                            .ThenBy(x => x.menu.Name)
                            .Select(m =>
                            {
                                var item = new PortalItem()
                                {
                                    Data = _mapper.Map<PortalItemData>(m.menu)
                                };
                                item.Data.ConfigCompleted = m.configCompleted;
                                return item;
                            })
                            .ToList();

                    var item = new PortalItem()
                    {
                        Data = _mapper.Map<PortalItemData>(x.menu),
                        Children = children.Any() ? children : null
                    };
                    item.Data.ConfigCompleted = x.configCompleted;
                    return item;
                });

            return root;
        }

        [HttpGet]
        [Route("name-exists")]
        public bool ExistName([FromQuery] string name, [FromQuery] Guid? id)
        {
            return _portalItemService.ExistName(name, id);
        }

        #region Folder

        [HttpPost]
        [Route("folder/create")]
        public Guid CreateFolder([FromBody] PortalItemData model)
        {
            model.Name = _portalItemService.GetCodeName(model.Label);
            model.Order = _depDbContext.SiteMenus
                    .Where(x => x.ParentId == model.ParentId)
                    .OrderByDescending(x => x.Order)
                    .Select(x => x.Order)
                    .FirstOrDefault() + 1;

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
            model.Name = _portalItemService.GetCodeName(model.Label);

            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new ApiException("Not Found", 404);
            }

            if (siteMenu.ParentId != model.ParentId)
            {
                // parent changed, reorder.
                model.Order = _depDbContext.SiteMenus
                    .Where(x => x.ParentId == model.ParentId)
                    .OrderByDescending(x => x.Order)
                    .Select(x => x.Order)
                    .FirstOrDefault() + 1;
            }

            if (siteMenu.Type == "System")
            {
                _mapper.Map(model, siteMenu);
                siteMenu.Type = "System";
            }
            else
            {
                _mapper.Map(model, siteMenu);
                siteMenu.ParentId = null;
                siteMenu.Type = "Folder";
            }

            _depDbContext.SaveChanges();

            return siteMenu.Id;
        }

        #endregion

        [HttpPut]
        [Route("{id}/publish")]
        public Guid Publish(Guid id)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new ApiException("Not Found", 404);
            }

            var item = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == siteMenu.Name);
            if (item != null)
            {
                if (!item.ConfigCompleted)
                {
                    throw new DepException("You can not publish this Portal Item due to you don't complete all configurations.");
                }
                else
                {
                    item.CurrentStep = "basic";
                }
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
        [Route("{id}/move-up")]
        public bool MoveUp(Guid id)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new ApiException("Not Found", 404);
            }

            var prevSiteMenu = _depDbContext.SiteMenus
                .Where(x => x.ParentId == siteMenu.ParentId && x.Order < siteMenu.Order)
                .OrderByDescending(x => x.Order)
                .FirstOrDefault();

            if (prevSiteMenu != null)
            {
                var order = siteMenu.Order;
                siteMenu.Order = prevSiteMenu.Order;
                prevSiteMenu.Order = order;
            }

            _depDbContext.SaveChanges();

            return true;
        }

        [HttpPost]
        [Route("{id}/move-down")]
        public bool MoveDown(Guid id)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new ApiException("Not Found", 404);
            }

            var nextSiteMenu = _depDbContext.SiteMenus
                .Where(x => x.ParentId == siteMenu.ParentId && x.Order > siteMenu.Order)
                .OrderBy(x => x.Order)
                .FirstOrDefault();

            if (nextSiteMenu != null)
            {
                var order = siteMenu.Order;
                siteMenu.Order = nextSiteMenu.Order;
                nextSiteMenu.Order = order;
            }

            _depDbContext.SaveChanges();

            return true;
        }

        #region Portal Item Basic

        [HttpGet]
        [Route("{id}/current-step")]
        public string CurrentStep(Guid id)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new ApiException("Not Found", 404);
            }

            var item = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == siteMenu.Name);

            return item.CurrentStep ?? "";
        }

        [HttpPost]
        [Route("{id}/current-step")]
        public string SaveCurrentStep(Guid id, [FromQuery] string step)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new ApiException("Not Found", 404);
            }

            var item = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == siteMenu.Name);
            item.CurrentStep = step;
            _depDbContext.SaveChanges();

            return item.CurrentStep ?? "";
        }

        [HttpGet]
        [Route("{id}/details")]
        public PortalItemData Details(Guid id)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new ApiException("Not Found", 404);
            }

            var item = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == siteMenu.Name);
            if (item == null) throw new Exception("Grid configuration does not exists with name: " + siteMenu.Name);

            var result = _mapper.Map<PortalItemData>(siteMenu);
            result.CurrentStep = item.CurrentStep;
            result.ConfigCompleted = item.ConfigCompleted;

            return result;
        }

        [HttpPost]
        [Route("create")]
        public Guid CreatePortalItem([FromBody] PortalItemData model)
        {
            return _portalItemService.Create(model);
        }

        [HttpPut]
        [Route("{id}/update")]
        public Guid UpdatePortalItem(Guid id, [FromBody] PortalItemData model)
        {
            return _portalItemService.Update(id, model);
        }

        #endregion

        #region Datasource configuration

        #region datasource connection crud

        [HttpGet]
        [Route("datasource/connections/list")]
        public List<DataSourceConnection> GetDataSourceConnectionList()
        {
            return _depDbContext.DataSourceConnections
                .Include(x => x.UniversalGridConfigurations)
                .Select(x => new DataSourceConnection()
                {
                    Id = x.Id,
                    Name = x.Name,
                    ConnectionString = x.ConnectionString,
                    UsedCount = x.UniversalGridConfigurations.Count()
                })
                .ToList();
        }

        [HttpPost]
        [Route("datasource/connections/create")]
        public Guid CreateDataSourceConnection([FromBody] DataSourceConnection model)
        {
            if (string.IsNullOrEmpty(model.Name) || string.IsNullOrEmpty(model.ConnectionString))
                throw new ArgumentNullException();

            try
            {
                // try to connect to database to validate if the connection string is valid.
                using (var con = _serviceProvider.GetRequiredService<DbConnection>())
                {
                    con.ConnectionString = model.ConnectionString;
                    con.Open();
                    con.Close();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message, ex);
                throw new DepException(ex.Message);
            }

            _depDbContext.DataSourceConnections.Add(model);
            _depDbContext.SaveChanges();

            return model.Id;
        }

        [HttpPut]
        [Route("datasource/connections/{id}/update")]
        public Guid UpdateDataSourceConnection(Guid id, [FromBody] DataSourceConnection model)
        {
            if (string.IsNullOrEmpty(model.Name) || string.IsNullOrEmpty(model.ConnectionString))
                throw new ArgumentNullException();

            var dsc = _depDbContext.DataSourceConnections.FirstOrDefault(x => x.Id == id);
            if (dsc == null)
                throw new ApiException("Not Found", 404);
            try
            {
                // try to connect to database to validate if the connection string is valid.
                using (var con = _serviceProvider.GetRequiredService<DbConnection>())
                {
                    con.ConnectionString = model.ConnectionString;
                    con.Open();
                    con.Close();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message, ex);
                throw new DepException(ex.Message);
            }

            dsc.Name = model.Name;
            dsc.ConnectionString = model.ConnectionString;
            _depDbContext.SaveChanges();

            return model.Id;
        }

        #endregion

        [HttpGet]
        [Route("datasource/connections")]
        public List<DataSourceConnection> GetDataSourceConnections()
        {
            return _depDbContext.DataSourceConnections.Select(x => new DataSourceConnection() { Name = x.Name, Id = x.Id }).ToList();
        }

        [HttpGet]
        [Route("datasource/{connectionId}/tables")]
        public List<DataSourceTable> GetDataSourceTables(Guid connectionId)
        {
            return _portalItemService.GetDataSourceTables(connectionId);
        }

        [HttpGet]
        [Route("datasource/{connectionId}/table-columns")]
        public List<DataSourceTableColumn> GetDataSourceTableColumns(Guid connectionId, [FromQuery] string tableSchema, [FromQuery] string tableName)
        {
            var sqlText = _dbSqlBuilder.GetSqlTextForDatabaseSource(new DataSourceConfig() { TableName = tableName, TableSchema = tableSchema });
            return _portalItemService.GetDataSourceTableColumns(connectionId, sqlText);
        }

        [HttpPost]
        [Route("datasource/{connectionId}/query-columns")]
        public List<DataSourceTableColumn> GetDataSourceQueryColumns(Guid connectionId, DataSourceConfig dsConfig)
        {
            var sqlText = _dbSqlBuilder.GetSqlTextForDatabaseSource(dsConfig);
            return _portalItemService.GetDataSourceTableColumns(connectionId, sqlText);
        }

        [HttpGet]
        [Route("{id}/datasource/columns")]
        public List<DataSourceTableColumn> GetDataSourceTableColumnsByPortalId(Guid id)
        {
            return _portalItemService.GetDataSourceTableColumnsByPortalId(id);
        }

        [HttpGet]
        [Route("{id}/datasource")]
        public DataSourceConfig GetDataSourceConfig(Guid id)
        {
            return _portalItemService.GetDataSourceConfig(id);
        }

        [HttpPost]
        [Route("{id}/datasource")]
        public bool SaveDataSourceConfig(Guid id, DataSourceConfig model)
        {
            return _portalItemService.SaveDataSourceConfig(id, model);
        }

        #endregion

        #region Grid Columns

        [HttpGet]
        [Route("{id}/grid-columns")]
        public List<GridColConfig> GetGridColumnsConfig(Guid id)
        {
            return _portalItemService.GetGridColumnsConfig(id);
        }

        [HttpPost]
        [Route("{id}/grid-columns")]
        public bool SaveGridColumnsConfig(Guid id, List<GridColConfig> model)
        {
            return _portalItemService.SaveGridColumnsConfig(id, model);
        }

        #endregion

        #region Grid Search

        [HttpGet]
        [Route("{id}/grid-search")]
        public List<SearchFieldConfig> GetGridSearchConfig(Guid id)
        {
            return _portalItemService.GetGridSearchConfig(id);
        }

        [HttpPost]
        [Route("{id}/grid-search")]
        public bool SaveGridSearchConfig(Guid id, List<SearchFieldConfig> model)
        {
            return _portalItemService.SaveGridSearchConfig(id, model);
        }

        #endregion

        #region Grid Form

        [HttpGet]
        [Route("{id}/grid-form")]
        public DetailConfig GetGridFormConfig(Guid id)
        {
            return _portalItemService.GetGridFormConfig(id);
        }

        [HttpPost]
        [Route("{id}/grid-form")]
        public bool SaveGridFormConfig(Guid id, DetailConfig model)
        {
            return _portalItemService.SaveGridFormConfig(id, model);
        }

        #endregion

        #region Custom Actions

        [HttpGet]
        [Route("{id}/custom-actions")]
        public List<CustomAction> GetCustomActions(Guid id)
        {
            return _portalItemService.GetCustomActions(id);
        }

        [HttpPost]
        [Route("{id}/custom-actions")]
        public bool SaveCustomActions(Guid id, List<CustomAction> model)
        {
            return _portalItemService.SaveCustomActions(id, model);
        }

        #endregion

    }
}
