using AutoMapper;
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
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Oracle.ManagedDataAccess.Client;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace DataEditorPortal.Web.Controllers
{
    [Authorize]
    [AdminAuthorizationFilter]
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
        private readonly IHostEnvironment _hostEnvironment;
        private readonly IMemoryCache _memoryCache;

        public PortalItemController(
            ILogger<PortalItemController> logger,
            DepDbContext depDbContext,
            IConfiguration config,
            IMapper mapper,
            IPortalItemService portalItemService,
            IQueryBuilder queryBuilder,
            IServiceProvider serviceProvider,
            IHostEnvironment hostEnvironment,
            IMemoryCache memoryCache)
        {
            _logger = logger;
            _depDbContext = depDbContext;
            _config = config;
            _mapper = mapper;
            _portalItemService = portalItemService;
            _queryBuilder = queryBuilder;
            _serviceProvider = serviceProvider;
            _hostEnvironment = hostEnvironment;
            _memoryCache = memoryCache;
        }

        [HttpGet]
        [Route("list")]
        public IEnumerable<PortalItem> List()
        {
            var menus = (
                    from m in _depDbContext.SiteMenus.Include(m => m.SiteGroups)
                    join u in _depDbContext.UniversalGridConfigurations on m.Name equals u.Name into us
                    from u in us.DefaultIfEmpty()
                    where m.Type != "Sub Portal Item"
                    select new
                    {
                        m,
                        configCompleted = u != null ? u.ConfigCompleted : (bool?)null,
                        itemType = u != null ? u.ItemType : null
                    }
                )
                .ToList()
                .Select(x =>
                {
                    var item = new PortalItem()
                    {
                        Data = _mapper.Map<PortalItemData>(x.m)
                    };
                    item.Data.ConfigCompleted = x.configCompleted;
                    item.Data.ItemType = x.itemType;
                    return item;
                }).ToList();

            var menuItems = menus
                .Where(m => m.Data.ParentId == null)
                .Select(m =>
                {
                    var path = SetRouterLink(m.Data);
                    m.Children = GetChildrenItems(menus, m.Data.Id, path);
                    return m;
                })
                .OrderBy(m => m.Data.Order)
                .ThenBy(m => m.Data.Name)
                .ToList();

            return menuItems;
        }

        private List<PortalItem> GetChildrenItems(IEnumerable<PortalItem> menus, Guid? parentId, string parentPath)
        {
            var menuItems = menus
                    .Where(m => m.Data.ParentId == parentId)
                    .Select(m =>
                    {
                        var path = SetRouterLink(m.Data, parentPath);
                        m.Children = GetChildrenItems(menus, m.Data.Id, path);
                        return m;
                    })
                    .OrderBy(m => m.Data.Order)
                    .ThenBy(m => m.Data.Name)
                    .ToList();

            return menuItems.Any() ? menuItems : null;
        }

        private string SetRouterLink(PortalItemData data, string parentPath = "")
        {
            var path = $"{parentPath}/{data.Name}";
            if (data.Type == "Portal Item" || data.Type == "System")
                data.RouterLink = path;

            return path;
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
            if (string.IsNullOrEmpty(model.Name))
                model.Name = _portalItemService.GetCodeName(model.Label);
            if (_portalItemService.ExistName(model.Name, null)) throw new DepException("Name does already exist.");

            model.Order = _depDbContext.SiteMenus
                    .Where(x => x.ParentId == model.ParentId)
                    .OrderByDescending(x => x.Order)
                    .Select(x => x.Order)
                    .FirstOrDefault() + 1;

            EnsureIconProcessed(model);

            var siteMenu = _mapper.Map<SiteMenu>(model);
            siteMenu.Status = Data.Common.PortalItemStatus.Draft;
            siteMenu.Component = "FolderLayoutComponent";

            // add site group
            siteMenu.SiteGroups = new List<SiteGroup>();
            if (model.SiteGroupIds == null) model.SiteGroupIds = new List<Guid>();
            var idsToAdd = model.SiteGroupIds.Where(x => siteMenu.SiteGroups.All(g => x != g.Id));
            var siteGroupsToAdd = _depDbContext.SiteGroups.Where(x => idsToAdd.Contains(x.Id)).ToList();
            siteGroupsToAdd.ForEach(g => siteMenu.SiteGroups.Add(g));

            _depDbContext.SiteMenus.Add(siteMenu);

            if (siteMenu.Type == "External")
            {
                CreateOrUpdatePermission(siteMenu);
            }

            _depDbContext.SaveChanges();

            return siteMenu.Id;
        }

        [HttpPut]
        [Route("menu-item/{id}/update")]
        public Guid UpdateMenuItem(Guid id, [FromBody] PortalItemData model)
        {
            if (string.IsNullOrEmpty(model.Name))
                model.Name = _portalItemService.GetCodeName(model.Label);
            if (_portalItemService.ExistName(model.Name, id)) throw new DepException("Name does already exist.");

            var siteMenu = _depDbContext.SiteMenus.Include(x => x.SiteGroups).FirstOrDefault(x => x.Id == id && x.Type != "Portal Item");
            if (siteMenu == null)
            {
                throw new DepException("Not Found", 404);
            }
            var oldName = siteMenu.Name;

            model.Type = siteMenu.Type;

            if (siteMenu.ParentId != model.ParentId)
            {
                // parent changed, reorder.
                model.Order = _depDbContext.SiteMenus
                    .Where(x => x.ParentId == model.ParentId)
                    .OrderByDescending(x => x.Order)
                    .Select(x => x.Order)
                    .FirstOrDefault() + 1;
            }

            EnsureIconProcessed(model);

            _mapper.Map(model, siteMenu);

            // update site group
            if (model.SiteGroupIds == null) model.SiteGroupIds = new List<Guid>();
            var idsToAdd = model.SiteGroupIds.Where(x => siteMenu.SiteGroups.All(g => x != g.Id));
            var siteGroupsToAdd = _depDbContext.SiteGroups.Where(x => idsToAdd.Contains(x.Id)).ToList();
            siteGroupsToAdd.ForEach(g => siteMenu.SiteGroups.Add(g));
            var siteGroupsToRemove = siteMenu.SiteGroups.Where(g => model.SiteGroupIds.All(x => x != g.Id)).ToList();
            siteGroupsToRemove.ForEach(g => siteMenu.SiteGroups.Remove(g));

            if (siteMenu.Type == "External")
            {
                CreateOrUpdatePermission(siteMenu, oldName);
            }

            _depDbContext.SaveChanges();

            return siteMenu.Id;
        }

        private void CreateOrUpdatePermission(SiteMenu siteMenu, string oldMenuName = null)
        {
            var types = new List<string> { "View" };

            List<SitePermission> permissions = new List<SitePermission>();
            if (!string.IsNullOrEmpty(oldMenuName))
            {
                // get old permissions
                var oldPermissionNames = types.Select(t => $"{t}_{ oldMenuName.Replace("-", "_") }".ToUpper());
                permissions = _depDbContext.SitePermissions.Where(x => oldPermissionNames.Contains(x.PermissionName)).ToList();
            }

            types.ForEach(t =>
            {
                SitePermission permission = null;
                if (!string.IsNullOrEmpty(oldMenuName))
                {
                    var oldName = $"{t}_{ oldMenuName.Replace("-", "_") }".ToUpper();
                    permission = permissions.FirstOrDefault(p => p.PermissionName == oldName);
                }

                if (permission == null)
                {
                    permission = new SitePermission() { Id = Guid.NewGuid() };
                    _depDbContext.Add(permission);
                }
                permission.Category = $"External Link: { siteMenu.Label }";
                permission.PermissionName = $"{t}_{ siteMenu.Name.Replace("-", "_") }".ToUpper();
                permission.PermissionDescription = $"{t} { siteMenu.Label }";
            });
        }


        [HttpDelete]
        [Route("menu-item/{id}/delete")]
        public Guid DeleteMenuItem(Guid id)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id && x.Type != "Portal Item" && x.Type != "System");
            if (siteMenu == null)
            {
                throw new DepException("Not Found", 404);
            }

            var isNotEmpty = _depDbContext.SiteMenus.Any(x => x.ParentId == id);
            if (isNotEmpty)
                throw new DepException("Folder is not empty");

            _depDbContext.Remove(siteMenu);
            _depDbContext.SaveChanges();

            if (siteMenu.Icon != null && siteMenu.Icon.StartsWith("icons/"))
            {
                // remove icon file, ignore error
                try
                {
                    System.IO.File.Delete(Path.Combine(_hostEnvironment.ContentRootPath, "App_Data", $"{ siteMenu.Icon}"));
                }
                catch { };
            }

            return siteMenu.Id;
        }

        private void EnsureIconProcessed(PortalItemData model)
        {
            if (string.IsNullOrEmpty(model.Icon)) return;

            string pattern = @"/api/attachment/download-temp-file/(?<fileId>[^/]+)/(?<fileName>[^/]+)";
            Match match = Regex.Match(model.Icon, pattern);
            if (match.Success)
            {
                string fileId = match.Groups["fileId"].Value;
                string fileName = match.Groups["fileName"].Value;

                if (model.Id == Guid.Empty) model.Id = Guid.NewGuid();

                string tempFolder = Path.Combine(_hostEnvironment.ContentRootPath, "App_Data\\FileUploadTemp");
                var tempFilePath = Path.Combine(tempFolder, $"{fileId} - {fileName}");

                string iconsFolder = Path.Combine(_hostEnvironment.ContentRootPath, $"App_Data\\Icons");
                if (!Directory.Exists(iconsFolder)) Directory.CreateDirectory(iconsFolder);

                var iconName = $"{model.Id}{Path.GetExtension(fileName)}";
                var destFilePath = Path.Combine(iconsFolder, iconName);

                // remove old icon, ignore error
                try
                {
                    var oldIcons = Directory.GetFiles(iconsFolder, $"{model.Id}*").ToList();
                    oldIcons.ForEach(f => System.IO.File.Delete(f));
                }
                catch { }

                // copy new icon
                System.IO.File.Copy(tempFilePath, destFilePath, true);

                // remove temp file, ignore error
                try { System.IO.File.Delete(tempFilePath); } catch { };

                model.Icon = $"icons/{iconName}";
            }
        }

        #endregion

        [HttpPut]
        [Route("{id}/publish")]
        public Guid Publish(Guid id)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new DepException("Not Found", 404);
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
                throw new DepException("Not Found", 404);
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
                throw new DepException("Not Found", 404);
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
                throw new DepException("Not Found", 404);
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
                throw new DepException("Not Found", 404);
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
                throw new DepException("Not Found", 404);
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
            var siteMenu = _depDbContext.SiteMenus.Include(x => x.SiteGroups).FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new DepException("Not Found", 404);
            }

            var item = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == siteMenu.Name);
            if (item == null) throw new Exception("Grid configuration does not exists with name: " + siteMenu.Name);

            var result = _mapper.Map<PortalItemData>(siteMenu);
            result.CurrentStep = item.CurrentStep;
            result.ConfigCompleted = item.ConfigCompleted;
            result.ItemType = item.ItemType;
            result.DataSourceConnectionName = item.DataSourceConnectionName;
            result.SiteGroupIds = result.SiteGroups.Select(x => x.Id).ToList();
            result.SiteGroups = null;

            return result;
        }

        [HttpPost]
        [Route("create")]
        public Guid CreatePortalItem([FromBody] PortalItemData model)
        {
            EnsureIconProcessed(model);

            return _portalItemService.Create(model);
        }

        [HttpPut]
        [Route("{id}/update")]
        public Guid UpdatePortalItem(Guid id, [FromBody] PortalItemData model)
        {
            EnsureIconProcessed(model);

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
                        ConnectionString = Regex.Replace(x.ds.ConnectionString, pattern, replacement, RegexOptions.IgnoreCase),
                        UsedCount = x.uCount + x.lCount,
                        IncludeSchemas = x.ds.IncludeSchemas,
                        TableNameRule = x.ds.TableNameRule
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
                throw new DepException("Name has already exist. Please use another one.");

            var connectionStr = GetConnectionString(model);

            ValidateConnectionString(connectionStr);

            _depDbContext.DataSourceConnections.Add(
                new DataSourceConnection()
                {
                    Name = model.Name,
                    ConnectionString = connectionStr,
                    TableNameRule = model.TableNameRule,
                    IncludeSchemas = model.IncludeSchemas
                }
            );
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
                throw new DepException("Not Found", 404);
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
            item.TableNameRule = model.TableNameRule;
            item.IncludeSchemas = model.IncludeSchemas;

            _depDbContext.SaveChanges();

            _memoryCache.Remove($"datasource_{name}_tables");

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
                _logger.LogError(ex, ex.Message);
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

                builder.DataSource = $"(DESCRIPTION=(ADDRESS_LIST=(ADDRESS=(PROTOCOL=TCP)(HOST={host})(PORT={port})))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME={con.DbName})))";

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
                throw new DepException("Not Found", 404);
            if (dsc.UniversalGridConfigurations.Count > 0)
                throw new DepException("Connnection is in use.");

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
                throw new DepException("Not Found", 404);
            }

            var item = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == siteMenu.Name);
            if (item == null) throw new Exception("Grid configuration does not exists with name: " + siteMenu.Name);

            var details = _mapper.Map<PortalItemData>(siteMenu);
            details.CurrentStep = item.CurrentStep;
            details.ConfigCompleted = item.ConfigCompleted;
            details.ItemType = item.ItemType;

            var datasource = JsonSerializer.Deserialize<DataSourceConfig>(!string.IsNullOrEmpty(item.DataSourceConfig) ? item.DataSourceConfig : "{}");
            var columns = JsonSerializer.Deserialize<List<GridColConfig>>(!string.IsNullOrEmpty(item.ColumnsConfig) ? item.ColumnsConfig : "[]"); ;

            var fields = new List<DataSourceTableColumn>();
            try
            {
                var sqlText = _queryBuilder.GetSqlTextForDatabaseSource(datasource);
                fields = _portalItemService.GetDataSourceTableColumns(datasource.DataSourceConnectionName, sqlText);
            }
            catch (Exception e)
            {
                _logger.LogError("Failed to get database columns for linked single table " + siteMenu.Name + " due to DataSourceConnectionName changed.");
                _logger.LogError(e, e.Message);
            }

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
        public IActionResult ExportPortalItem(Guid id)
        {
            var fs = _portalItemService.ExportPortalItem(id);

            return File(fs, "application/octet-stream", $"Export_{DateTime.UtcNow:yyyy-MM-dd-HH-mm-ss}.zip");
        }

        [HttpPost]
        [Route("preview-import")]
        public List<PortalItemPreviewModel> PreviewImport([FromBody] PortalItemImportModel model)
        {
            return _portalItemService.PreviewImport(model);
        }

        [HttpPost]
        [Route("confirm-import")]
        public bool ConfirmImport([FromBody] PortalItemImportModel model)
        {
            _portalItemService.ConfirmImport(model);

            return true;
        }
    }
}
