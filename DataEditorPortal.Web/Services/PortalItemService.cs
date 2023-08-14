using AutoMapper;
using Dapper;
using DataEditorPortal.Data.Common;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Models;
using DataEditorPortal.Web.Models.PortalItem;
using DataEditorPortal.Web.Models.UniversalGrid;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Xml.Serialization;

namespace DataEditorPortal.Web.Services
{
    public interface IPortalItemService
    {
        string GetCodeName(string name);
        bool ExistName(string name, Guid? id);
        Guid Create(PortalItemData model);
        Guid Update(Guid id, PortalItemData model);

        bool Copy(Guid id);
        bool Delete(Guid id);
        List<DataSourceTable> GetDataSourceTables(string connectionName);
        List<DataSourceTableColumn> GetDataSourceTableColumns(string connectionName, string sqlText);
        List<DataSourceTableColumn> GetDataSourceTableColumnsByPortalId(Guid id, bool forForm);
        DataSourceConfig GetDataSourceConfig(Guid id);
        bool SaveDataSourceConfig(Guid id, DataSourceConfig model);
        List<GridColConfig> GetGridColumnsConfig(Guid id);
        bool SaveGridColumnsConfig(Guid id, List<GridColConfig> model);
        List<SearchFieldConfig> GetGridSearchConfig(Guid id);
        bool SaveGridSearchConfig(Guid id, List<SearchFieldConfig> model);
        DetailConfig GetGridFormConfig(Guid id);
        bool SaveGridFormConfig(Guid id, DetailConfig model);
        List<CustomAction> GetCustomActions(Guid id);
        bool SaveCustomActions(Guid id, List<CustomAction> model);
        LinkedDataSourceConfig GetLinkedDataSourceConfig(Guid id);
        bool SaveLinkedDataSourceConfig(Guid id, LinkedDataSourceConfig model);
        MemoryStream ExportPortalItem(Guid id);
        List<PortalItemPreviewModel> PreviewImport(PortalItemImportModel model);
        void ConfirmImport(PortalItemImportModel model);
    }

    public class PortalItemService : IPortalItemService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly DepDbContext _depDbContext;
        private readonly IQueryBuilder _queryBuilder;
        private readonly ILogger<PortalItemService> _logger;
        private readonly IMapper _mapper;
        private IHttpContextAccessor _httpContextAccessor;
        private readonly IMemoryCache _memoryCache;
        private readonly IHostEnvironment _hostEnvironment;

        public PortalItemService(
            IServiceProvider serviceProvider,
            DepDbContext depDbContext,
            IQueryBuilder queryBuilder,
            ILogger<PortalItemService> logger,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor,
            IMemoryCache memoryCache,
            IHostEnvironment hostEnvironment)
        {
            _serviceProvider = serviceProvider;
            _depDbContext = depDbContext;
            _queryBuilder = queryBuilder;
            _logger = logger;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _memoryCache = memoryCache;
            _hostEnvironment = hostEnvironment;
        }

        public bool ExistName(string name, Guid? id)
        {
            var codeName = GetCodeName(name);

            var existInGroup = _depDbContext.SiteGroups.Where(x => x.Name == codeName && x.Id != id).Any();
            var existInMenu = _depDbContext.SiteMenus.Where(x => x.Name == codeName && x.Id != id).Any();

            return existInGroup || existInMenu;
        }

        public string GetCodeName(string name)
        {
            var codeName = RemoveCharacters(name, UnicodeCategory.OtherNotAssigned);
            codeName = codeName.Normalize(NormalizationForm.FormD);
            codeName = RemoveCharacters(codeName, UnicodeCategory.NonSpacingMark);
            codeName = codeName.Normalize(NormalizationForm.FormC);
            codeName = Regex.Replace(codeName, "[^a-zA-Z0-9-]+", "-");

            return codeName.Trim('-').ToLower();
        }

        private static string RemoveCharacters(string s, UnicodeCategory category)
        {
            StringBuilder val = (StringBuilder)(object)new StringBuilder();
            for (int i = 0; i < s.Length; i++)
            {
                char c = s[i];
                if (CharUnicodeInfo.GetUnicodeCategory(c) != category)
                {
                    val.Append(c);
                }
            }
            return ((Object)val).ToString();
        }

        public Guid Create(PortalItemData model)
        {
            if (string.IsNullOrEmpty(model.Name))
                model.Name = GetCodeName(model.Label);
            if (ExistName(model.Name, null)) throw new DepException("Portal Name does already exist.");

            var username = AppUser.ParseUsername(_httpContextAccessor.HttpContext.User.Identity.Name).Username;
            var userId = _depDbContext.Users.FirstOrDefault(x => x.Username == username).Id;

            model.Order = _depDbContext.SiteMenus
                .Where(x => x.ParentId == model.ParentId)
                .OrderByDescending(x => x.Order)
                .Select(x => x.Order)
                .FirstOrDefault() + 1;

            // create site menu
            var siteMenu = _mapper.Map<SiteMenu>(model);
            siteMenu.Status = Data.Common.PortalItemStatus.Draft;
            siteMenu.Type = model.ItemType == GridItemType.LINKED_SINGLE ? "Sub Portal Item" : "Portal Item";
            siteMenu.Component = "UniversalGridModule";
            siteMenu.RequireAuth = true;

            // add site group
            siteMenu.SiteGroups = new List<SiteGroup>();
            if (model.SiteGroupIds == null) model.SiteGroupIds = new List<Guid>();
            var idsToAdd = model.SiteGroupIds.Where(x => siteMenu.SiteGroups.All(g => x != g.Id));
            var siteGroupsToAdd = _depDbContext.SiteGroups.Where(x => idsToAdd.Contains(x.Id)).ToList();
            siteGroupsToAdd.ForEach(g => siteMenu.SiteGroups.Add(g));

            _depDbContext.SiteMenus.Add(siteMenu);

            // create universal grid configuration
            var item = new UniversalGridConfiguration();
            item.Name = siteMenu.Name;
            item.ItemType = model.ItemType;
            item.CreatedBy = userId;
            item.CreatedDate = DateTime.UtcNow;
            _depDbContext.UniversalGridConfigurations.Add(item);

            // create permissions
            CreateOrUpdatePermission(siteMenu, item);

            _depDbContext.SaveChanges();

            return siteMenu.Id;
        }

        public Guid Update(Guid id, PortalItemData model)
        {
            var siteMenu = _depDbContext.SiteMenus.Include(x => x.SiteGroups).FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new DepException("Not Found", 404);
            }
            var oldName = siteMenu.Name;

            if (string.IsNullOrEmpty(model.Name))
                model.Name = GetCodeName(model.Label);
            if (ExistName(model.Name, id)) throw new DepException("Portal Name does already exist.");

            var item = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == siteMenu.Name);
            item.Name = model.Name;

            if (siteMenu.ParentId != model.ParentId)
            {
                // parent changed, reorder.
                model.Order = _depDbContext.SiteMenus
                    .Where(x => x.ParentId == model.ParentId)
                    .OrderByDescending(x => x.Order)
                .Select(x => x.Order)
                .FirstOrDefault() + 1;
            }
            _mapper.Map(model, siteMenu);
            siteMenu.Status = Data.Common.PortalItemStatus.Draft;
            siteMenu.Type = model.ItemType == GridItemType.LINKED_SINGLE ? "Sub Portal Item" : "Portal Item";

            // update site group
            if (model.SiteGroupIds == null) model.SiteGroupIds = new List<Guid>();
            var idsToAdd = model.SiteGroupIds.Where(x => siteMenu.SiteGroups.All(g => x != g.Id));
            var siteGroupsToAdd = _depDbContext.SiteGroups.Where(x => idsToAdd.Contains(x.Id)).ToList();
            siteGroupsToAdd.ForEach(g => siteMenu.SiteGroups.Add(g));
            var siteGroupsToRemove = siteMenu.SiteGroups.Where(g => model.SiteGroupIds.All(x => x != g.Id)).ToList();
            siteGroupsToRemove.ForEach(g => siteMenu.SiteGroups.Remove(g));

            // update permissions
            CreateOrUpdatePermission(siteMenu, item, oldName);

            _depDbContext.SaveChanges();
            return siteMenu.Id;
        }

        public bool Delete(Guid id)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id && x.Type != "System");
            if (siteMenu == null)
            {
                throw new DepException("Not Found", 404);
            }

            DeleteInternal(siteMenu);
            _depDbContext.SaveChanges();

            if (siteMenu.Icon != null && siteMenu.Icon.StartsWith("icons/"))
            {
                // remove icon file, ignore error
                try
                {
                    File.Delete(Path.Combine(_hostEnvironment.ContentRootPath, "App_Data", $"{ siteMenu.Icon}"));
                }
                catch { };
            }

            return true;
        }

        private void DeleteInternal(SiteMenu siteMenu)
        {
            if (siteMenu != null)
            {
                var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == siteMenu.Name);
                if (config != null)
                {
                    // remove lookups
                    var lookups = _depDbContext.Lookups.Where(x => x.UniversalGridConfigurationId == config.Id).ToList();
                    lookups.ForEach(l => _depDbContext.Lookups.Remove(l));

                    // remove permission
                    var types = GetPermissionTypes(config);

                    // get old permissions
                    var oldPermissionNames = types.Select(t => $"{t}_{ config.Name.Replace("-", "_") }".ToUpper());
                    var permissions = _depDbContext.SitePermissions.Where(x => oldPermissionNames.Contains(x.PermissionName)).ToList();
                    permissions.ForEach(p =>
                    {
                        _depDbContext.UserPermissions
                           .Where(up => up.PermissionGrantId == p.Id)
                           .ToList()
                           .ForEach(up => _depDbContext.UserPermissions.Remove(up));

                        _depDbContext.SiteRolePermissions
                           .Where(srp => srp.SitePermissionId == p.Id)
                           .ToList()
                           .ForEach(srp => _depDbContext.SiteRolePermissions.Remove(srp));

                        _depDbContext.SitePermissions.Remove(p);
                    });

                    // remove saved searches
                    var searches = _depDbContext.SavedSearches.Where(x => x.UniversalGridConfigurationId == config.Id).ToList();
                    searches.ForEach(s => _depDbContext.SavedSearches.Remove(s));

                    // remove configuration
                    _depDbContext.UniversalGridConfigurations.Remove(config);
                }

                // remove linked table
                var childrenMenus = _depDbContext.SiteMenus.Where(x => x.ParentId == siteMenu.Id).ToList();
                childrenMenus.ForEach(m => DeleteInternal(m));

                // remove siteMenu
                _depDbContext.SiteMenus.Remove(siteMenu);

                // remove cache
                RemoveGridCache(siteMenu.Name);
            }
        }

        public bool Copy(Guid id)
        {
            var siteMenu = _depDbContext.SiteMenus.Include(x => x.SiteGroups).FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new DepException("Not Found", 404);
            }

            var username = AppUser.ParseUsername(_httpContextAccessor.HttpContext.User.Identity.Name).Username;
            var userId = _depDbContext.Users.FirstOrDefault(x => x.Username == username).Id;
            var allNames = _depDbContext.SiteMenus.Select(m => new SiteMenu() { Name = m.Name, Label = m.Label }).ToList();

            var siteMenuCopy = _mapper.Map<SiteMenu>(siteMenu);
            siteMenuCopy.Id = Guid.NewGuid();
            siteMenuCopy.Order = _depDbContext.SiteMenus
                .Where(x => x.ParentId == siteMenuCopy.ParentId)
                .OrderByDescending(x => x.Order)
                .Select(x => x.Order)
                .FirstOrDefault() + 1;

            CopyInternal(siteMenu, siteMenuCopy, userId, allNames);

            _depDbContext.SaveChanges();

            // copy custom icon file
            if (siteMenu.Icon != null && siteMenu.Icon.StartsWith("icons/"))
            {
                var destIcon = siteMenu.Icon.Replace(siteMenu.Id.ToString(), siteMenuCopy.Id.ToString());

                var sourceIconFile = Path.Combine(_hostEnvironment.ContentRootPath, "App_Data", $"{siteMenu.Icon}");
                var destIconFile = Path.Combine(_hostEnvironment.ContentRootPath, "App_Data", $"{destIcon}");

                File.Copy(sourceIconFile, destIconFile);

                siteMenuCopy.Icon = destIcon;
                _depDbContext.SaveChanges();
            }

            return true;
        }

        public void CopyInternal(SiteMenu siteMenuSource, SiteMenu siteMenuCopy, Guid userId, List<SiteMenu> allNames)
        {
            if (siteMenuSource == null) return;

            #region find unique label and name

            var tempName = $"{siteMenuSource.Name}-copy";
            var dup = 0;
            while (allNames.Any(m => m.Name == tempName))
            {
                dup++;
                tempName = $"{siteMenuSource.Name}-copy-{dup}";
            }
            var tempLabel = $"{siteMenuSource.Label} - Copy";
            dup = 0;
            while (allNames.Any(m => m.Label == tempLabel))
            {
                dup++;
                tempLabel = $"{siteMenuSource.Label} - Copy {dup}";
            }
            allNames.Add(new SiteMenu() { Name = tempName, Label = tempLabel });

            #endregion

            #region clone site menu

            siteMenuCopy.Name = tempName;
            siteMenuCopy.Label = tempLabel;
            siteMenuCopy.Status = PortalItemStatus.Draft;
            _depDbContext.SiteMenus.Add(siteMenuCopy);

            #endregion

            #region clone grid config

            RemoveGridCache(tempName);

            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == siteMenuSource.Name);
            if (config == null) throw new DepException("No Grid configration for this portal item.");

            var configCopy = _mapper.Map<UniversalGridConfiguration>(config);
            configCopy.Id = Guid.NewGuid();
            configCopy.Name = tempName;
            configCopy.CreatedBy = userId;
            configCopy.CreatedDate = DateTime.UtcNow;
            _depDbContext.UniversalGridConfigurations.Add(configCopy);

            #region clone lookups

            var lookups = _depDbContext.Lookups.Where(x => x.UniversalGridConfigurationId == config.Id).ToList();
            foreach (var lookup in lookups)
            {
                var lookupCopy = _mapper.Map<Lookup>(lookup);
                lookupCopy.Id = Guid.NewGuid();
                lookupCopy.UniversalGridConfigurationId = configCopy.Id;

                _depDbContext.Lookups.Add(lookupCopy);

                configCopy.SearchConfig = configCopy.SearchConfig.Replace(lookup.Id.ToString(), lookupCopy.Id.ToString());
                configCopy.DetailConfig = configCopy.DetailConfig.Replace(lookup.Id.ToString(), lookupCopy.Id.ToString());
            }

            #endregion

            #region clone saved searches

            var savedSearches = _depDbContext.SavedSearches.Where(x => x.UniversalGridConfigurationId == config.Id).ToList();
            foreach (var search in savedSearches)
            {
                var searchCopy = _mapper.Map<SavedSearch>(search);
                searchCopy.Id = Guid.NewGuid();
                searchCopy.UniversalGridConfigurationId = configCopy.Id;
                _depDbContext.SavedSearches.Add(searchCopy);
            }

            #endregion

            #region create and sync permissions

            var types = GetPermissionTypes(config);

            // get old permissions
            var permissionNames = types.Select(t => $"{t}_{ config.Name.Replace("-", "_") }".ToUpper());
            var permissions = _depDbContext.SitePermissions.Where(x => permissionNames.Contains(x.PermissionName)).ToList();

            types.ForEach(t =>
            {
                var permissionCopy = new SitePermission() { Id = Guid.NewGuid() };
                permissionCopy.Category = $"Portal Item: { siteMenuCopy.Label }";
                permissionCopy.PermissionName = $"{t}_{ siteMenuCopy.Name.Replace("-", "_") }".ToUpper();
                permissionCopy.PermissionDescription = $"{t} { siteMenuCopy.Label }";
                _depDbContext.Add(permissionCopy);

                // find the source permission and check if it is assigned to a user or role
                // if yes, assign the cloned one to user or role
                var permissionName = $"{t}_{ config.Name.Replace("-", "_") }".ToUpper();
                var permission = permissions.FirstOrDefault(p => p.PermissionName == permissionName);
                if (permission != null)
                {
                    _depDbContext.UserPermissions
                       .Where(up => up.PermissionGrantId == permission.Id)
                       .ToList()
                       .ForEach(up =>
                       {
                           _depDbContext.UserPermissions.Add(new UserPermission()
                           {
                               GrantType = up.GrantType,
                               UserId = up.UserId,
                               CreatedBy = userId,
                               CreatedDate = DateTime.UtcNow,
                               PermissionGrantId = permissionCopy.Id
                           });
                       });

                    _depDbContext.SiteRolePermissions
                       .Where(srp => srp.SitePermissionId == permission.Id)
                       .ToList()
                       .ForEach(srp =>
                       {
                           _depDbContext.SiteRolePermissions.Add(new SiteRolePermission()
                           {
                               SiteRoleId = srp.SiteRoleId,
                               CreatedBy = userId,
                               CreatedDate = DateTime.UtcNow,
                               SitePermissionId = permissionCopy.Id
                           });
                       });
                }
            });

            #endregion


            #endregion

            // clone children
            var childrenMenus = _depDbContext.SiteMenus.Where(x => x.ParentId == siteMenuSource.Id).OrderBy(x => x.Order).ToList();
            childrenMenus.ForEach(m =>
            {
                var mCopy = _mapper.Map<SiteMenu>(m);
                mCopy.Id = Guid.NewGuid();
                mCopy.ParentId = siteMenuCopy.Id;

                CopyInternal(m, mCopy, userId, allNames);

                // update linked datasource
                if (configCopy.ItemType == GridItemType.LINKED)
                {
                    configCopy.DataSourceConfig = configCopy.DataSourceConfig.Replace(m.Id.ToString(), mCopy.Id.ToString());
                }
            });
        }

        private void CreateOrUpdatePermission(SiteMenu siteMenu, UniversalGridConfiguration config, string oldMenuName = null)
        {
            var types = GetPermissionTypes(config);

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
                permission.Category = $"Portal Item: { siteMenu.Label }";
                permission.PermissionName = $"{t}_{ siteMenu.Name.Replace("-", "_") }".ToUpper();
                permission.PermissionDescription = $"{t} { siteMenu.Label }";
            });
        }

        private List<string> GetPermissionTypes(UniversalGridConfiguration config)
        {
            var types = new List<string>();
            if (config.ItemType == GridItemType.SINGLE) types = new List<string> { "View", "Add", "Edit", "Delete", "Export" };
            if (config.ItemType == GridItemType.LINKED_SINGLE) types = new List<string> { "Add", "Edit", "Delete", "Export" };
            if (config.ItemType == GridItemType.LINKED) types = new List<string> { "View" };

            return types;
        }

        public List<DataSourceTable> GetDataSourceTables(string name)
        {
            return _memoryCache.GetOrCreate($"datasource_{name}_tables", entry =>
            {
                entry.SetSlidingExpiration(TimeSpan.FromMinutes(60));

                var result = new List<DataSourceTable>();

                var dsConnection = _depDbContext.DataSourceConnections.FirstOrDefault(c => c.Name == name);

                using (var con = _serviceProvider.GetRequiredService<IDbConnection>())
                {
                    con.ConnectionString = dsConnection.ConnectionString;

                    #region prepair sql and parameters

                    var useSchemaRule = false;
                    var useTableNameRule = false;
                    var paramDic = new Dictionary<string, object>() { };
                    if (!string.IsNullOrEmpty(dsConnection.IncludeSchemas))
                    {
                        var schemas = dsConnection.IncludeSchemas.Split(',', StringSplitOptions.RemoveEmptyEntries);
                        if (schemas.Any())
                        {
                            useSchemaRule = true;
                            paramDic.Add("SCHEMAS", schemas);
                        }
                    }
                    if (!string.IsNullOrEmpty(dsConnection.TableNameRule))
                    {
                        useTableNameRule = true;
                        paramDic.Add("TABLE_NAME_RULE", dsConnection.TableNameRule);
                    }

                    var param = _queryBuilder.GenerateDynamicParameter(paramDic);
                    var sql = _queryBuilder.GetSqlTextForDatabaseTables(useSchemaRule, useTableNameRule);

                    #endregion

                    try
                    {
                        result = con.Query<DataSourceTable>(sql, param).ToList();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, ex.Message);
                        throw new DepException("An Error in the query has occurred: " + ex.Message);
                    }
                    finally
                    {
                        con.Close();
                    }
                }

                return result.OrderBy(t => t.TableSchema).ThenBy(t => t.TableName).ToList();
            });
        }

        public List<DataSourceTableColumn> GetDataSourceTableColumns(string name, string sqlText)
        {
            var result = new List<DataSourceTableColumn>();

            var dsConnection = _depDbContext.DataSourceConnections.FirstOrDefault(c => c.Name == name);
            if (dsConnection == null)
                return result;

            using (var con = _serviceProvider.GetRequiredService<IDbConnection>())
            {
                con.ConnectionString = dsConnection.ConnectionString;

                var cmd = con.CreateCommand();
                cmd.Connection = con;
                cmd.CommandText = sqlText;

                try
                {
                    con.Open();
                    using (var dr = cmd.ExecuteReader(CommandBehavior.SchemaOnly))
                    {
                        var schema = dr.GetSchemaTable();
                        foreach (DataRow row in schema.Rows)
                        {
                            result.Add(new DataSourceTableColumn()
                            {
                                AllowDBNull = (bool)row["AllowDBNull"],
                                ColumnName = (string)row["ColumnName"],
                                IsAutoIncrement = (bool)row["IsAutoIncrement"],
                                IsIdentity = (bool)row["IsIdentity"],
                                IsKey = row["IsKey"] == DBNull.Value ? false : (bool)row["IsKey"],
                                IsUnique = row["IsUnique"] == DBNull.Value ? false : (bool)row["IsUnique"],
                                FilterType = _queryBuilder.GetFilterType(row)
                            });
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, ex.Message);
                    throw new DepException("An Error in the query has occurred: " + ex.Message);
                }
                finally
                {
                    con.Close();
                }
            }

            return result;
        }

        public List<DataSourceTableColumn> GetDataSourceTableColumnsByPortalId(Guid id, bool forForm = false)
        {
            var datasourceConfig = GetDataSourceConfig(id);
            if (datasourceConfig == null)
                throw new DepException("DataSource Config is empty for Portal Item: " + id);

            var sqlText = _queryBuilder.GetSqlTextForDatabaseSource(datasourceConfig);
            var result = GetDataSourceTableColumns(datasourceConfig.DataSourceConnectionName, sqlText);
            if (forForm)
            {
                var columns = GetGridColumnsConfig(id).Where(x => x.type == "AttachmentField").ToList();
                columns.ForEach(x => result.Add(new DataSourceTableColumn()
                {
                    FilterType = "attachmentField",
                    AllowDBNull = true,
                    ColumnName = x.field
                }));
            }
            return result;
        }

        public DataSourceConfig GetDataSourceConfig(Guid id)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new DepException("Not Found", 404);
            }

            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == siteMenu.Name);
            if (config == null) throw new Exception("Grid configuration does not exists with name: " + siteMenu.Name);

            if (!string.IsNullOrEmpty(config.DataSourceConfig))
            {
                return JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);
            }
            else
            {
                var defaultConfig = new DataSourceConfig();
                if (config.ItemType == GridItemType.LINKED_SINGLE)
                {
                    // get main configration
                    var datasourceConnectionName = (
                        from u in _depDbContext.UniversalGridConfigurations
                        join mp in _depDbContext.SiteMenus on u.Name equals mp.Name
                        join mc in _depDbContext.SiteMenus on mp.Id equals mc.ParentId
                        where mc.Id == id
                        select u.DataSourceConnectionName
                    ).FirstOrDefault();
                    if (!string.IsNullOrEmpty(datasourceConnectionName))
                        defaultConfig.DataSourceConnectionName = datasourceConnectionName;
                }
                return defaultConfig;
            }
        }

        public bool SaveDataSourceConfig(Guid id, DataSourceConfig model)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new DepException("Not Found", 404);
            }

            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == siteMenu.Name);
            if (config == null) throw new Exception("Grid configuration does not exists with name: " + siteMenu.Name);

            if (!string.IsNullOrEmpty(config.DataSourceConfig))
            {
                var dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);
                if (dataSourceConfig.DataSourceConnectionName != model.DataSourceConnectionName ||
                    dataSourceConfig.TableSchema != model.TableSchema || dataSourceConfig.TableName != model.TableName ||
                    dataSourceConfig.QueryText != dataSourceConfig.QueryText)
                {
                    config.ConfigCompleted = false;
                }
            }

            config.DataSourceConfig = JsonSerializer.Serialize(model);
            config.DataSourceConnectionName = model.DataSourceConnectionName;
            siteMenu.Status = Data.Common.PortalItemStatus.Draft;

            _depDbContext.SaveChanges();

            RemoveGridCache(config.Name);

            return true;
        }

        public List<GridColConfig> GetGridColumnsConfig(Guid id)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new DepException("Not Found", 404);
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
                var sqlText = _queryBuilder.GetSqlTextForDatabaseSource(datasourceConfig);
                var columns = GetDataSourceTableColumns(datasourceConfig.DataSourceConnectionName, sqlText);
                return columns.Select(x => new GridColConfig()
                {
                    type = "DataBaseField",
                    field = x.ColumnName,
                    header = x.ColumnName,
                    width = 200,
                    filterType = x.FilterType,
                    sortable = true,
                    filterable = true
                }).ToList();
            }
        }

        public bool SaveGridColumnsConfig(Guid id, List<GridColConfig> model)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new DepException("Not Found", 404);
            }

            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == siteMenu.Name);
            if (config == null) throw new Exception("Grid configuration does not exists with name: " + siteMenu.Name);

            config.ColumnsConfig = JsonSerializer.Serialize(model);
            siteMenu.Status = Data.Common.PortalItemStatus.Draft;

            _depDbContext.SaveChanges();

            RemoveGridCache(config.Name);

            return true;
        }

        public List<SearchFieldConfig> GetGridSearchConfig(Guid id)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new DepException("Not Found", 404);
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
                throw new DepException("Not Found", 404);
            }

            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == siteMenu.Name);
            if (config == null) throw new Exception("Grid configuration does not exists with name: " + siteMenu.Name);

            config.SearchConfig = JsonSerializer.Serialize(model);
            siteMenu.Status = Data.Common.PortalItemStatus.Draft;

            // save search to primary table and secondary table if current table is linked
            if (config.ItemType == GridItemType.LINKED)
            {
                var linkedDataSourceConfig = JsonSerializer.Deserialize<LinkedDataSourceConfig>(config.DataSourceConfig);

                var query = from m in _depDbContext.SiteMenus
                            join u in _depDbContext.UniversalGridConfigurations on m.Name equals u.Name
                            where m.ParentId == siteMenu.Id
                            select new { m.Id, u };
                var list = query.ToList();
                list.ForEach(mu =>
                {
                    var isPrimary = linkedDataSourceConfig.PrimaryTable.Id == mu.Id;
                    var searchConfig = JsonSerializer.Deserialize<List<SearchFieldConfig>>(config.SearchConfig);
                    searchConfig.ForEach(x =>
                    {
                        if (!isPrimary) x.searchRule = x.searchRule1;
                        x.searchRule1 = null;
                    });
                    mu.u.SearchConfig = JsonSerializer.Serialize(searchConfig);

                    RemoveGridCache(mu.u.Name);
                });

                config.ConfigCompleted = true;
            }

            _depDbContext.SaveChanges();

            RemoveGridCache(config.Name);

            return true;
        }

        public DetailConfig GetGridFormConfig(Guid id)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new DepException("Not Found", 404);
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
                throw new DepException("Not Found", 404);
            }

            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == siteMenu.Name);
            if (config == null) throw new Exception("Grid configuration does not exists with name: " + siteMenu.Name);

            config.DetailConfig = JsonSerializer.Serialize(model);
            config.ConfigCompleted = true;

            siteMenu.Status = Data.Common.PortalItemStatus.Draft;

            _depDbContext.SaveChanges();

            RemoveGridCache(config.Name);

            return true;
        }

        public List<CustomAction> GetCustomActions(Guid id)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new DepException("Not Found", 404);
            }

            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == siteMenu.Name);
            if (config == null) throw new Exception("Grid configuration does not exists with name: " + siteMenu.Name);

            if (!string.IsNullOrEmpty(config.CustomActionConfig))
            {
                return JsonSerializer.Deserialize<List<CustomAction>>(config.CustomActionConfig);
            }
            else
            {
                return new List<CustomAction>();
            }
        }

        public bool SaveCustomActions(Guid id, List<CustomAction> model)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new DepException("Not Found", 404);
            }

            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == siteMenu.Name);
            if (config == null) throw new Exception("Grid configuration does not exists with name: " + siteMenu.Name);

            config.CustomActionConfig = JsonSerializer.Serialize(model);

            _depDbContext.SaveChanges();

            RemoveGridCache(config.Name);

            return true;
        }

        // linked table 
        public LinkedDataSourceConfig GetLinkedDataSourceConfig(Guid id)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new DepException("Not Found", 404);
            }

            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == siteMenu.Name);
            if (config == null) throw new Exception("Grid configuration does not exists with name: " + siteMenu.Name);

            var dsConfig = JsonSerializer.Deserialize<LinkedDataSourceConfig>(!string.IsNullOrEmpty(config.DataSourceConfig) ? config.DataSourceConfig : "{}");
            if (dsConfig.PrimaryTable == null || dsConfig.SecondaryTable == null)
            {
                var result = new LinkedDataSourceConfig();
                var ids = _depDbContext.SiteMenus.Where(x => x.ParentId == siteMenu.Id).OrderBy(x => x.Order).Select(x => x.Id).ToList();
                if (dsConfig.PrimaryTable == null && ids.Count >= 1)
                    dsConfig.PrimaryTable = new LinkedTableConfig() { Id = ids[0] };
                if (dsConfig.SecondaryTable == null && ids.Count >= 2)
                    dsConfig.SecondaryTable = new LinkedTableConfig() { Id = ids[1] };
            }
            return dsConfig;
        }

        public bool SaveLinkedDataSourceConfig(Guid id, LinkedDataSourceConfig model)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new DepException("Not Found", 404);
            }

            if (model.PrimaryTable != null && model.PrimaryTable.Id == Guid.Empty) model.PrimaryTable = null;
            if (model.SecondaryTable != null && model.SecondaryTable.Id == Guid.Empty) model.SecondaryTable = null;

            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == siteMenu.Name);
            if (config == null) throw new Exception("Grid configuration does not exists with name: " + siteMenu.Name);

            config.DataSourceConfig = JsonSerializer.Serialize(model);
            config.DataSourceConnectionName = model.LinkTable.DataSourceConnectionName;
            siteMenu.Status = Data.Common.PortalItemStatus.Draft;

            _depDbContext.SaveChanges();

            RemoveGridCache(config.Name);

            var linkedTables = _depDbContext.SiteMenus.Where(x => x.ParentId == siteMenu.Id).ToList();
            foreach (var linkedTable in linkedTables)
            {
                var dsConfig = GetDataSourceConfig(linkedTable.Id);
                dsConfig.DataSourceConnectionName = config.DataSourceConnectionName;
                SaveDataSourceConfig(linkedTable.Id, dsConfig);
                _memoryCache.Remove($"grid.{linkedTable.Name}.linked.table.info");
            }

            return true;
        }

        private void RemoveGridCache(string name)
        {
            _memoryCache.Remove($"grid.{name}");
            _memoryCache.Remove($"grid.{name}.datasource");
            _memoryCache.Remove($"grid.{name}.attachment.cols");
        }

        #region Export & Import

        public MemoryStream ExportPortalItem(Guid id)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new DepException("Not Found", 404);
            }

            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == siteMenu.Name);
            if (config == null) throw new Exception("Grid configuration does not exists with name: " + siteMenu.Name);


            var ds = _depDbContext.DataSourceConnections.Where(x => x.Name == config.DataSourceConnectionName).ToList();
            var menus = _depDbContext.SiteMenus.Where(x => x.Id == id || x.ParentId == id).OrderByDescending(x => x.ParentId).ToList();
            var configs = _depDbContext.UniversalGridConfigurations.Where(x => menus.Select(m => m.Name).Contains(x.Name)).ToList();
            var lookups = _depDbContext.Lookups.Where(x => configs.Select(c => c.Id).Contains(x.UniversalGridConfigurationId.Value)).ToList();

            var zipMemoryStream = new MemoryStream();
            using (var archive = new ZipArchive(zipMemoryStream, ZipArchiveMode.Create, true))
            {
                // Add the XML files to the zip archive
                AddFileToZipArchive(archive, GetXml(menus), $"SiteMenus.xml");
                AddFileToZipArchive(archive, GetXml(ds), "DataSourceConnections.xml");
                AddFileToZipArchive(archive, GetXml(configs), "UniversalGridConfigurations.xml");
                AddFileToZipArchive(archive, GetXml(lookups), "Lookups.xml");
            }

            zipMemoryStream.Position = 0;
            return zipMemoryStream;
        }

        public List<PortalItemPreviewModel> PreviewImport(PortalItemImportModel model)
        {
            if (model.ParentId.HasValue)
            {
                var parentExist = _depDbContext.SiteMenus.Any(x => x.Id == model.ParentId && x.Type == "Folder");
                if (!parentExist)
                {
                    throw new DepException("Parent Not Found", 404);
                }
            }

            string tempFolder = Path.Combine(_hostEnvironment.ContentRootPath, "App_Data\\FileUploadTemp");
            var tempFilePath = Path.Combine(tempFolder, $"{model.Attachment.FileId} - {model.Attachment.FileName}");
            if (!File.Exists(tempFilePath)) throw new DepException("Uploaded File doesn't exist.");

            var result = new List<PortalItemPreviewModel>();
            try
            {
                using (var archive = ZipFile.OpenRead(tempFilePath))
                {
                    #region portal item entry

                    var smEntry = archive.Entries.FirstOrDefault(e => e.Name == "SiteMenus.xml");
                    var configEntry = archive.Entries.FirstOrDefault(e => e.Name == "UniversalGridConfigurations.xml");
                    if (smEntry == null || configEntry == null) throw new FileNotFoundException();

                    var siteMenus = GetObjects<List<SiteMenu>>(smEntry);
                    var configs = GetObjects<List<UniversalGridConfiguration>>(configEntry);
                    if (siteMenus.Count == 0) throw new DepException("No Site Menus exists.");
                    if (configs.Count == 0) throw new DepException("No Universal Grid Config exists.");

                    // find parent site menu
                    var parentIds = siteMenus.Select(c => c.ParentId);
                    var parentSiteMenu = siteMenus.Where(m => parentIds.Contains(m.Id)).ToList();
                    if (!parentSiteMenu.Any()) parentSiteMenu = siteMenus;

                    var siteMenukeys = parentSiteMenu.Select(c => c.Id).ToList();
                    var existSiteMenus = _depDbContext.SiteMenus.Where(x => siteMenukeys.Contains(x.Id)).Select(x => x.Id).ToList();

                    result.AddRange(parentSiteMenu.Select(x =>
                        new PortalItemPreviewModel()
                        {
                            Key = x.Id.ToString(),
                            DisplayName = x.Name,
                            Type = "Portal Item",
                            Exist = existSiteMenus.Contains(x.Id)
                        }
                    ));

                    #endregion

                    #region datasource entry

                    var dsEntry = archive.Entries.FirstOrDefault(e => e.Name == "DataSourceConnections.xml");
                    if (dsEntry == null) throw new FileNotFoundException();

                    var connections = GetObjects<List<DataSourceConnection>>(dsEntry);
                    var connectionKeys = connections.Select(c => c.Name).ToList();
                    var existConnectionKeys = _depDbContext.DataSourceConnections
                        .Where(x => connectionKeys.Contains(x.Name))
                        .Select(x => x.Name)
                        .ToList();

                    result.AddRange(connections.Select(x =>
                        new PortalItemPreviewModel()
                        {
                            Key = x.Name,
                            DisplayName = x.Name,
                            Type = "DataSource Connection",
                            Exist = existConnectionKeys.Contains(x.Name)
                        }
                    ));

                    #endregion

                    #region lookups entry

                    var lookupEntry = archive.Entries.FirstOrDefault(e => e.Name == "Lookups.xml");
                    if (lookupEntry == null) throw new FileNotFoundException();

                    var lookups = GetObjects<List<Lookup>>(lookupEntry);
                    var lookupKeys = lookups.Select(c => c.Id).ToList();
                    var existLookups = _depDbContext.Lookups.Where(x => lookupKeys.Contains(x.Id)).Select(x => x.Id).ToList();

                    result.AddRange(lookups.Select(x =>
                        new PortalItemPreviewModel()
                        {
                            Key = x.Id.ToString(),
                            DisplayName = x.Name,
                            Type = "Lookup",
                            Exist = existLookups.Contains(x.Id)
                        }
                    ));

                    #endregion
                }
            }
            catch (FileNotFoundException e)
            {
                _logger.LogError(e, e.Message);
                throw new DepException("The uploaded file doesn't contains files required. Please make sure it is exported from the application and without any changes.");
            }
            catch (Exception e)
            {
                _logger.LogError(e, e.Message);
                throw;
            }

            return result;
        }

        public void ConfirmImport(PortalItemImportModel model)
        {
            if (model.ParentId.HasValue)
            {
                var parentExist = _depDbContext.SiteMenus.Any(x => x.Id == model.ParentId && x.Type == "Folder");
                if (!parentExist)
                {
                    throw new DepException("Parent Not Found", 404);
                }
            }
            string tempFolder = Path.Combine(_hostEnvironment.ContentRootPath, "App_Data\\FileUploadTemp");
            var tempFilePath = Path.Combine(tempFolder, $"{model.Attachment.FileId} - {model.Attachment.FileName}");
            if (!File.Exists(tempFilePath)) throw new DepException("Uploaded File doesn't exist.");

            var result = new List<PortalItemPreviewModel>();
            try
            {
                using (var archive = ZipFile.OpenRead(tempFilePath))
                {
                    #region datasource entry
                    // get zip archive entry
                    var dsEntry = archive.Entries.FirstOrDefault(e => e.Name == "DataSourceConnections.xml");
                    if (dsEntry == null) throw new FileNotFoundException();

                    // get connections and cache existing keys
                    var connections = GetObjects<List<DataSourceConnection>>(dsEntry).Where(x => model.SelectedObjects.Contains(x.Name));
                    var connectionKeys = connections.Select(c => c.Name).ToList();
                    var existConnections = _depDbContext.DataSourceConnections.Where(x => connectionKeys.Contains(x.Name)).ToList();

                    foreach (var connection in connections)
                    {
                        var entity = existConnections.FirstOrDefault(x => x.Name == connection.Name);
                        if (entity != null)
                        {
                            entity.ConnectionString = connection.ConnectionString;
                        }
                        else
                        {
                            _depDbContext.Add(connection);
                        }
                    }

                    #endregion

                    #region portal item entry

                    // get zip archive entry
                    var smEntry = archive.Entries.FirstOrDefault(e => e.Name == "SiteMenus.xml");
                    var configEntry = archive.Entries.FirstOrDefault(e => e.Name == "UniversalGridConfigurations.xml");
                    if (smEntry == null || configEntry == null) throw new FileNotFoundException();

                    // get site menus and cache existing keys
                    var siteMenus = GetObjects<List<SiteMenu>>(smEntry);
                    var siteMenuKeys = siteMenus.Select(c => c.Id).ToList();
                    var existSitemenus = _depDbContext.SiteMenus.Where(x => siteMenuKeys.Contains(x.Id)).ToList();

                    // get configs and cache existing keys
                    var configs = GetObjects<List<UniversalGridConfiguration>>(configEntry);
                    var configKeys = configs.Select(c => c.Id).ToList();
                    var existConfigs = _depDbContext.UniversalGridConfigurations.Where(x => configKeys.Contains(x.Id)).ToList();

                    if (siteMenus.Count == 0) throw new DepException("No site menus exists");

                    // find parent site menu
                    var parentIds = siteMenus.Select(c => c.ParentId);
                    var parentSiteMenu = siteMenus.FirstOrDefault(m => parentIds.Contains(m.Id));
                    if (parentSiteMenu == null) parentSiteMenu = siteMenus[0];

                    // cache userid and allNames
                    var username = AppUser.ParseUsername(_httpContextAccessor.HttpContext.User.Identity.Name).Username;
                    var userId = _depDbContext.Users.FirstOrDefault(x => x.Username == username).Id;
                    var allNames = _depDbContext.SiteMenus.Select(m => new { m.Id, m.Name }).ToList();

                    foreach (var siteMenu in siteMenus)
                    {
                        // find unique name
                        var tempName = GetCodeName(siteMenu.Name);
                        var dup = 0;
                        while (allNames.Any(n => n.Id != siteMenu.Id && n.Name == tempName))
                        {
                            dup++;
                            tempName = $"{GetCodeName(siteMenu.Name)}-{dup}";
                        }
                        allNames.Add(new { Id = siteMenu.Id, Name = tempName });

                        // change parent if the site menu is the parent site menu. 
                        if (siteMenu.Id == parentSiteMenu.Id)
                            siteMenu.ParentId = model.ParentId;

                        var siteMenuEntity = existSitemenus.FirstOrDefault(x => x.Id == siteMenu.Id);
                        if (siteMenuEntity != null)
                        {
                            var oldOrder = siteMenuEntity.Order; // cache old order.

                            _mapper.Map(siteMenu, siteMenuEntity); // update site menu
                            siteMenuEntity.Name = tempName;

                            if (siteMenuEntity.Id == parentSiteMenu.Id && siteMenuEntity.ParentId != model.ParentId)
                            {
                                // site menu exist, and parentId is changed. update order.
                                siteMenuEntity.Order = _depDbContext.SiteMenus
                                    .Where(x => x.ParentId == model.ParentId)
                                    .OrderByDescending(x => x.Order)
                                    .Select(x => x.Order)
                                    .FirstOrDefault() + 1;
                            }
                            else
                            {
                                siteMenuEntity.Order = oldOrder;
                            }
                        }
                        else
                        {
                            siteMenuEntity = _mapper.Map<SiteMenu>(siteMenu);
                            siteMenuEntity.Name = tempName;
                            if (siteMenuEntity.Id == parentSiteMenu.Id)
                            {
                                siteMenuEntity.Order = _depDbContext.SiteMenus
                                .Where(x => x.ParentId == model.ParentId)
                                .OrderByDescending(x => x.Order)
                                .Select(x => x.Order)
                                .FirstOrDefault() + 1;
                            }
                            _depDbContext.SiteMenus.Add(siteMenuEntity); // add new site menu
                        }

                        // find the config for current site menu
                        var config = configs.FirstOrDefault(c => c.Name == siteMenu.Name);
                        var configEntity = existConfigs.FirstOrDefault(x => x.Id == config.Id);
                        if (configEntity != null)
                        {
                            var oldName = configEntity.Name; // cache old name.

                            _mapper.Map(config, configEntity); // update config
                            configEntity.Name = tempName;

                            CreateOrUpdatePermission(siteMenuEntity, configEntity, oldName);
                        }
                        else
                        {
                            // add config
                            configEntity = _mapper.Map<UniversalGridConfiguration>(config);
                            configEntity.Name = tempName;
                            configEntity.CreatedBy = userId;
                            configEntity.CreatedDate = DateTime.UtcNow;

                            _depDbContext.UniversalGridConfigurations.Add(configEntity);

                            CreateOrUpdatePermission(siteMenuEntity, configEntity);
                        }
                    }

                    #endregion

                    #region lookups entry
                    // get zip archive entry
                    var lookupEntry = archive.Entries.FirstOrDefault(e => e.Name == "Lookups.xml");
                    if (lookupEntry == null) throw new FileNotFoundException();

                    // get lookups and cache existing keys
                    var lookups = GetObjects<List<Lookup>>(lookupEntry).Where(x => model.SelectedObjects.Contains(x.Id.ToString()));
                    var lookupKeys = lookups.Select(c => c.Id).ToList();
                    var existLookups = _depDbContext.Lookups.Where(x => lookupKeys.Contains(x.Id)).ToList();

                    foreach (var lookup in lookups)
                    {
                        var entity = existLookups.FirstOrDefault(x => x.Id == lookup.Id);
                        if (entity != null)
                        {
                            entity.QueryText = lookup.QueryText;
                            entity.Name = lookup.Name;
                        }
                        else
                        {
                            _depDbContext.Add(lookup);
                        }
                    }

                    #endregion

                    _depDbContext.SaveChanges();
                }

                try { File.Delete(tempFilePath); } catch { };
            }
            catch (FileNotFoundException e)
            {
                _logger.LogError(e, e.Message);
                throw new DepException("The uploaded file doesn't contains files required. Please make sure it is exported from the application and without any changes.");
            }
            catch (Exception e)
            {
                _logger.LogError(e, e.Message);
                throw;
            }
        }

        private string GetXml<T>(T obj)
        {
            var serializer = new XmlSerializer(typeof(T));

            // Create a StringWriter to hold the XML output
            using (var stringWriter = new StringWriter())
            {
                // Serialize the object to XML
                serializer.Serialize(stringWriter, obj);

                // Get the serialized XML string
                return stringWriter.ToString();
            }
        }
        private T GetObjects<T>(ZipArchiveEntry entry)
        {
            var serializer = new XmlSerializer(typeof(T));

            using (Stream entryStream = entry.Open())
            {
                using (StreamReader reader = new StreamReader(entryStream))
                {
                    return (T)serializer.Deserialize(reader);
                }
            }
        }
        private void AddFileToZipArchive(ZipArchive archive, string xmlString, string fileName)
        {
            using (var memoryStream = new MemoryStream(Encoding.UTF8.GetBytes(xmlString)))
            {
                var entry = archive.CreateEntry(fileName);
                using (var entryStream = entry.Open())
                {
                    memoryStream.CopyTo(entryStream);
                }
            }
        }

        #endregion
    }
}
