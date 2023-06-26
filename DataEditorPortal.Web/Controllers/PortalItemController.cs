using AutoMapper;
using AutoWrapper.Filters;
using AutoWrapper.Wrappers;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Models.PortalItem;
using DataEditorPortal.Web.Models.UniversalGrid;
using DataEditorPortal.Web.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Oracle.ManagedDataAccess.Client;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Text.RegularExpressions;

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
        private readonly IQueryBuilder _queryBuilder;
        private readonly IServiceProvider _serviceProvider;

        public PortalItemController(
            ILogger<PortalItemController> logger,
            DepDbContext depDbContext,
            IConfiguration config,
            IMapper mapper,
            IPortalItemService portalItemService,
            IQueryBuilder queryBuilder,
            IServiceProvider serviceProvider)
        {
            _logger = logger;
            _depDbContext = depDbContext;
            _config = config;
            _mapper = mapper;
            _portalItemService = portalItemService;
            _queryBuilder = queryBuilder;
            _serviceProvider = serviceProvider;
        }

        [HttpGet]
        [Route("list")]
        public IEnumerable<PortalItem> List()
        {
            var query = from m in _depDbContext.SiteMenus
                        join p in _depDbContext.UniversalGridConfigurations on m.Name equals p.Name into mps
                        from mp in mps.DefaultIfEmpty()
                        where m.Type != "Sub Portal Item"
                        select new
                        {
                            menu = m,
                            configCompleted = mp != null ? mp.ConfigCompleted : (bool?)null,
                            itemType = mp != null ? mp.ItemType : null
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
                                item.Data.ItemType = m.itemType;
                                return item;
                            })
                            .ToList();

                    var item = new PortalItem()
                    {
                        Data = _mapper.Map<PortalItemData>(x.menu),
                        Children = children.Any() ? children : null
                    };
                    item.Data.ConfigCompleted = x.configCompleted;
                    item.Data.ItemType = x.itemType;
                    return item;
                });

            return root;
        }

        [HttpGet]
        [Route("name-exists")]
        public bool ExistName([FromQuery] string name, [FromQuery] Guid? id)
        {
            if (string.IsNullOrEmpty(name)) return true;

            return _portalItemService.ExistName(name, id);
        }

        [HttpGet]
        [Route("get-code-name")]
        public string GetCodeNamme([FromQuery] string name)
        {
            return _portalItemService.GetCodeName(name);
        }

        #region Simple Menu

        [HttpPost]
        [Route("menu-item/create")]
        public Guid CreateMenuItem([FromBody] PortalItemData model)
        {
            model.Name = _portalItemService.GetCodeName(model.Label);

            if (model.Type == "Folder")
                model.ParentId = null;

            model.Order = _depDbContext.SiteMenus
                    .Where(x => x.ParentId == model.ParentId)
                    .OrderByDescending(x => x.Order)
                    .Select(x => x.Order)
                    .FirstOrDefault() + 1;

            var siteMenu = _mapper.Map<SiteMenu>(model);
            siteMenu.Status = Data.Common.PortalItemStatus.Draft;
            _depDbContext.SiteMenus.Add(siteMenu);

            if (siteMenu.Type == "External")
            {
                var permission = new SitePermission()
                {
                    Category = $"External Link: { model.Label }",
                    PermissionName = $"View_{ model.Name.Replace("-", "_") }".ToUpper(),
                    PermissionDescription = $"View { model.Label }"
                };
                _depDbContext.Add(permission);
            }

            _depDbContext.SaveChanges();

            return siteMenu.Id;
        }

        [HttpPut]
        [Route("menu-item/{id}/update")]
        public Guid UpdateMenuItem(Guid id, [FromBody] PortalItemData model)
        {
            model.Name = _portalItemService.GetCodeName(model.Label);

            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id && x.Type != "Portal Item");
            if (siteMenu == null)
            {
                throw new ApiException("Not Found", 404);
            }

            model.Type = siteMenu.Type;
            if (model.Type == "Folder")
                model.ParentId = null;

            if (siteMenu.ParentId != model.ParentId)
            {
                // parent changed, reorder.
                model.Order = _depDbContext.SiteMenus
                    .Where(x => x.ParentId == model.ParentId)
                    .OrderByDescending(x => x.Order)
                    .Select(x => x.Order)
                    .FirstOrDefault() + 1;
            }

            if (siteMenu.Type == "External")
            {
                // update permissions
                var permissions = _depDbContext.SitePermissions.Where(x => x.Category == $"External Link: { siteMenu.Label }").ToList();

                permissions.ForEach(p =>
                {
                    p.Category = p.Category.Replace(siteMenu.Label, model.Label);
                    p.PermissionName = p.PermissionName.Replace(siteMenu.Name.Replace("-", "_").ToUpper(), model.Name.Replace("-", "_").ToUpper());
                    p.PermissionDescription = p.PermissionDescription.Replace(siteMenu.Label, model.Label);
                });
            }

            _mapper.Map(model, siteMenu);

            _depDbContext.SaveChanges();

            return siteMenu.Id;
        }


        [HttpDelete]
        [Route("menu-item/{id}/delete")]
        public Guid DeleteMenuItem(Guid id)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id && x.Type != "Portal Item" && x.Type != "System");
            if (siteMenu == null)
            {
                throw new ApiException("Not Found", 404);
            }

            var isNotEmpty = _depDbContext.SiteMenus.Any(x => x.ParentId == id);
            if (isNotEmpty)
                throw new ApiException("Folder is not empty");

            _depDbContext.Remove(siteMenu);
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
            result.ItemType = item.ItemType;
            result.DataSourceConnectionName = item.DataSourceConnectionName;

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

        [HttpDelete]
        [Route("{id}/delete")]
        public bool Delete(Guid id)
        {
            return _portalItemService.Delete(id);
        }

        #endregion

        #region Datasource configuration

        #region datasource connection crud

        [HttpGet]
        [Route("datasource/connections/list")]
        public List<DataSourceConnectionModel> GetDataSourceConnectionList()
        {
            var query = from ds in _depDbContext.DataSourceConnections
                        select new
                        {
                            ds = ds,
                            uCount = _depDbContext.UniversalGridConfigurations.Count(u => u.DataSourceConnectionName == ds.Name),
                            lCount = _depDbContext.Lookups.Count(l => l.DataSourceConnectionName == ds.Name)
                        };

            string pattern = @"(Pwd|Password)=(\w+)";
            string replacement = "$1=******";
            var type = _config.GetValue<string>("DatabaseProvider");

            var result = query.ToList()
                .Select(x =>
                {
                    var dsItem = new DataSourceConnectionModel()
                    {
                        Name = x.ds.Name,
                        ConnectionString = Regex.Replace(x.ds.ConnectionString, pattern, replacement),
                        UsedCount = x.uCount + x.lCount
                    };

                    if (type == "SqlConnection")
                    {
                        var builder = new SqlConnectionStringBuilder();
                        builder.ConnectionString = dsItem.ConnectionString;

                        dsItem.ServerName = builder.DataSource;
                        dsItem.Authentication = builder.IntegratedSecurity == true ? "Windows Authentication" : "Sql Server Authentication";
                        dsItem.Username = builder.UserID;
                        //c.Password = builder.Password;
                        dsItem.DbName = builder.InitialCatalog;
                    }
                    else
                    {
                        var builder = new OracleConnectionStringBuilder();
                        builder.ConnectionString = dsItem.ConnectionString;

                        dsItem.Authentication = "Oracle Database Native";
                        dsItem.Username = builder.UserID;
                        //c.Password = builder.Password;

                        string pattern = @"HOST=([^)]+)\).*PORT=([^)]+)\).*SERVICE_NAME=([^)]+)\)";
                        Match match = Regex.Match(builder.DataSource, pattern);
                        if (match.Success)
                        {
                            string host = match.Groups[1].Value;
                            string port = match.Groups[2].Value;

                            dsItem.ServerName = $"{host}{(port == "1521" ? "" : ":" + port)}";
                            dsItem.DbName = match.Groups[3].Value;
                        }
                    }

                    return dsItem;
                })
                .ToList();

            return result;
        }

        [HttpPost]
        [Route("datasource/connections/create")]
        public string CreateDataSourceConnection([FromBody] DataSourceConnectionModel model)
        {
            if (string.IsNullOrEmpty(model.Name) || string.IsNullOrEmpty(model.ServerName)
                || string.IsNullOrEmpty(model.Authentication) || string.IsNullOrEmpty(model.DbName))
                throw new ArgumentNullException();

            var dsc = _depDbContext.DataSourceConnections.FirstOrDefault(x => x.Name == model.Name);
            if (dsc != null)
                throw new ApiException("Name has already exist. Please use another one.");

            var connectionStr = GetConnectionString(model);

            ValidateConnectionString(connectionStr);

            _depDbContext.DataSourceConnections.Add(new DataSourceConnection() { Name = model.Name, ConnectionString = connectionStr });
            _depDbContext.SaveChanges();

            return model.Name;
        }


        [HttpPut]
        [Route("datasource/connections/{name}/update")]
        public string UpdateDataSourceConnection(string name, [FromBody] DataSourceConnectionModel model)
        {
            var item = _depDbContext.DataSourceConnections.FirstOrDefault(x => x.Name == name);
            if (item == null)
            {
                throw new ApiException("Not Found", 404);
            }

            if (string.IsNullOrEmpty(model.Name) || string.IsNullOrEmpty(model.ServerName)
                || string.IsNullOrEmpty(model.Authentication) || string.IsNullOrEmpty(model.DbName))
                throw new ArgumentNullException();

            // if password is null or empty, means user doesn't change password, will get the orignal password and use it to validate.
            if (string.IsNullOrEmpty(model.Password))
            {
                var type = _config.GetValue<string>("DatabaseProvider");
                var password = string.Empty;
                if (type == "SqlConnection")
                {
                    var builder = new SqlConnectionStringBuilder();
                    builder.ConnectionString = item.ConnectionString;
                    password = builder.Password;
                }
                else
                {
                    var builder = new OracleConnectionStringBuilder();
                    builder.ConnectionString = item.ConnectionString;
                    password = builder.Password;
                }
                model.Password = password;
            }

            var connectionStr = GetConnectionString(model);

            ValidateConnectionString(connectionStr);

            item.ConnectionString = connectionStr;
            _depDbContext.SaveChanges();

            return model.Name;
        }

        private void ValidateConnectionString(string connectionStr)
        {
            try
            {
                // try to connect to database to validate if the connection string is valid.
                using (var con = _serviceProvider.GetRequiredService<IDbConnection>())
                {
                    con.ConnectionString = connectionStr;
                    con.Open();
                    con.Close();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message, ex);
                throw new DepException(ex.Message);
            }
        }
        private string GetConnectionString(DataSourceConnectionModel con)
        {
            var dbType = _config.GetValue<string>("DatabaseProvider");
            if (dbType == "SqlConnection")
            {
                var builder = new SqlConnectionStringBuilder();
                builder.DataSource = con.ServerName;

                if (con.Authentication == "Windows Authentication")
                {
                    builder.IntegratedSecurity = true;
                }
                else
                {
                    builder.UserID = con.Username;
                    builder.Password = con.Password;
                }
                builder.InitialCatalog = con.DbName;

                return builder.ToString();
            }
            else
            {
                var host = con.ServerName;
                var port = "1521";

                var strArray = con.ServerName.Split(':');
                if (strArray.Length == 2)
                {
                    host = strArray[0];
                    port = strArray[1];
                }

                var builder = new OracleConnectionStringBuilder();

                builder.DataSource = $"(DESCRIPTION=(ADDRESS_LIST=(ADDRESS=(PROTOCOL=TCP)(HOST={host})(PORT={port})))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME={con.DbName})));";

                if (con.Authentication == "OS Authentication")
                {
                    // get from current server.
                    builder.UserID = con.Username;
                    builder.Password = con.Password;
                }
                else
                {
                    builder.UserID = con.Username;
                    builder.Password = con.Password;
                }

                return builder.ToString();
            }
        }

        [HttpDelete]
        [Route("datasource/connections/{name}/delete")]
        public bool DeleteDataSourceConnection(string name)
        {
            var dsc = _depDbContext.DataSourceConnections
                .Include(x => x.UniversalGridConfigurations)
                .FirstOrDefault(x => x.Name == name);
            if (dsc == null)
                throw new ApiException("Not Found", 404);
            if (dsc.UniversalGridConfigurations.Count > 0)
                throw new ApiException("Connnection is in use.");

            _depDbContext.DataSourceConnections.Remove(dsc);
            _depDbContext.SaveChanges();

            return true;
        }

        #endregion

        [HttpGet]
        [Route("datasource/connections")]
        public List<DataSourceConnection> GetDataSourceConnections()
        {
            return _depDbContext.DataSourceConnections.Select(x => new DataSourceConnection() { Name = x.Name }).ToList();
        }

        [HttpGet]
        [Route("datasource/{connectionName}/tables")]
        public List<DataSourceTable> GetDataSourceTables(string connectionName)
        {
            return _portalItemService.GetDataSourceTables(connectionName);
        }

        [HttpGet]
        [Route("datasource/{connectionName}/table-columns")]
        public List<DataSourceTableColumn> GetDataSourceTableColumns(string connectionName, [FromQuery] string tableSchema, [FromQuery] string tableName)
        {
            var sqlText = _queryBuilder.GetSqlTextForDatabaseSource(new DataSourceConfig() { TableName = tableName, TableSchema = tableSchema });
            return _portalItemService.GetDataSourceTableColumns(connectionName, sqlText);
        }

        [HttpPost]
        [Route("datasource/{connectionName}/query-columns")]
        public List<DataSourceTableColumn> GetDataSourceQueryColumns(string connectionName, DataSourceConfig dsConfig)
        {
            var sqlText = _queryBuilder.GetSqlTextForDatabaseSource(dsConfig);
            return _portalItemService.GetDataSourceTableColumns(connectionName, sqlText);
        }

        [HttpGet]
        [Route("{id}/datasource/columns")]
        public List<DataSourceTableColumn> GetDataSourceTableColumnsByPortalId(Guid id, [FromQuery] bool forForm)
        {
            return _portalItemService.GetDataSourceTableColumnsByPortalId(id, forForm);
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

        #region Linked Datasource

        [HttpGet]
        [Route("{id}/linked-datasource")]
        public LinkedDataSourceConfig GetLinkedDataSourceConfig(Guid id)
        {
            return _portalItemService.GetLinkedDataSourceConfig(id);
        }

        [HttpPost]
        [Route("{id}/linked-datasource")]
        public bool SaveLinkedDataSourceConfig(Guid id, LinkedDataSourceConfig model)
        {
            return _portalItemService.SaveLinkedDataSourceConfig(id, model);
        }

        [HttpGet]
        [Route("{id}/linked-single-config")]
        public dynamic GetLinkedSingleTableConfig(Guid id)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new ApiException("Not Found", 404);
            }

            var item = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == siteMenu.Name);
            if (item == null) throw new Exception("Grid configuration does not exists with name: " + siteMenu.Name);

            var details = _mapper.Map<PortalItemData>(siteMenu);
            details.CurrentStep = item.CurrentStep;
            details.ConfigCompleted = item.ConfigCompleted;
            details.ItemType = item.ItemType;

            var datasource = JsonSerializer.Deserialize<DataSourceConfig>(!string.IsNullOrEmpty(item.DataSourceConfig) ? item.DataSourceConfig : "{}");
            var columns = JsonSerializer.Deserialize<List<GridColConfig>>(!string.IsNullOrEmpty(item.ColumnsConfig) ? item.ColumnsConfig : "[]"); ;

            var sqlText = _queryBuilder.GetSqlTextForDatabaseSource(datasource);
            var fields = _portalItemService.GetDataSourceTableColumns(datasource.DataSourceConnectionName, sqlText);

            return new
            {
                details = new object[] { details },
                idColumn = datasource.IdColumn,
                gridColumns = columns.Select(x => new { label = x.field, value = x.field }),
                databaseColumns = fields.Select(x => new { label = x.ColumnName, value = x.ColumnName })
            };
        }

        #endregion

        [HttpPost]
        [Route("{id}/export")]
        [AutoWrapIgnore]
        public IActionResult ExportData(Guid id)
        {
            var fs = _portalItemService.ExportPortalItem(id);

            return File(fs, "application/octet-stream", $"Export_{DateTime.UtcNow:yyyy-MM-dd-HH-mm-ss}.zip");
        }
    }
}
