using AutoMapper;
using AutoWrapper.Wrappers;
using DataEditorPortal.Data.Common;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Models;
using DataEditorPortal.Web.Models.PortalItem;
using DataEditorPortal.Web.Models.UniversalGrid;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
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

        public PortalItemService(
            IServiceProvider serviceProvider,
            DepDbContext depDbContext,
            IQueryBuilder queryBuilder,
            ILogger<PortalItemService> logger,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor,
            IMemoryCache memoryCache)
        {
            _serviceProvider = serviceProvider;
            _depDbContext = depDbContext;
            _queryBuilder = queryBuilder;
            _logger = logger;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _memoryCache = memoryCache;
        }

        public bool ExistName(string name, Guid? id)
        {
            var codeName = GetCodeName(name);
            return _depDbContext.SiteMenus.Where(x => x.Name == codeName && x.Id != id).Any();
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
            _depDbContext.SiteMenus.Add(siteMenu);

            // create universal grid configuration
            var item = new UniversalGridConfiguration();
            item.Name = siteMenu.Name;
            item.ItemType = model.ItemType;
            item.CreatedBy = userId;
            item.CreatedDate = DateTime.UtcNow;
            _depDbContext.UniversalGridConfigurations.Add(item);

            // create permissions
            CreateOrUpdatePermission(siteMenu, model);

            _depDbContext.SaveChanges();

            return siteMenu.Id;
        }

        public Guid Update(Guid id, PortalItemData model)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new ApiException("Not Found", 404);
            }

            if (string.IsNullOrEmpty(model.Name))
                model.Name = GetCodeName(model.Label);
            if (ExistName(model.Name, id)) throw new DepException("Portal Name does already exist.");

            // update permissions
            CreateOrUpdatePermission(siteMenu, model);

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

            _depDbContext.SaveChanges();
            return siteMenu.Id;
        }

        public bool Delete(Guid id)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id && x.Type != "System");
            if (siteMenu == null)
            {
                throw new ApiException("Not Found", 404);
            }

            DeleteInternal(siteMenu);
            _depDbContext.SaveChanges();

            return true;
        }

        private void DeleteInternal(SiteMenu siteMenu)
        {
            if (siteMenu != null)
            {
                // remove permission
                var permissions = _depDbContext.SitePermissions.Where(x => x.Category == $"Portal Item: { siteMenu.Label }").ToList();
                permissions.ForEach(p => _depDbContext.SitePermissions.Remove(p));

                // remove configuration
                var item = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == siteMenu.Name);
                _depDbContext.UniversalGridConfigurations.Remove(item);

                // remove linked table
                var childrenMenus = _depDbContext.SiteMenus.Where(x => x.ParentId == siteMenu.Id).ToList();
                childrenMenus.ForEach(m => DeleteInternal(m));

                // remove siteMenu
                _depDbContext.SiteMenus.Remove(siteMenu);
            }
        }

        private void CreateOrUpdatePermission(SiteMenu siteMenu, PortalItemData model)
        {
            var types = new List<string>();
            if (model.ItemType == GridItemType.SINGLE) types = new List<string> { "View", "Add", "Edit", "Delete", "Export" };
            if (model.ItemType == GridItemType.LINKED_SINGLE) types = new List<string> { "Add", "Edit", "Delete", "Export" };
            if (model.ItemType == GridItemType.LINKED) types = new List<string> { "View" };

            // get old permissions
            var oldPermissionNames = types.Select(t => $"{t}_{ siteMenu.Name.Replace("-", "_") }".ToUpper());
            var permissions = _depDbContext.SitePermissions.Where(x => oldPermissionNames.Contains(x.PermissionName)).ToList();

            types.ForEach(t =>
            {
                var oldName = $"{t}_{ siteMenu.Name.Replace("-", "_") }".ToUpper();
                var permission = permissions.FirstOrDefault(p => p.PermissionName == oldName);

                if (permission == null)
                {
                    permission = new SitePermission() { Id = Guid.NewGuid() };
                    _depDbContext.Add(permission);
                }
                permission.Category = $"Portal Item: { model.Label }";
                permission.PermissionName = $"{t}_{ model.Name.Replace("-", "_") }".ToUpper();
                permission.PermissionDescription = $"{t} { model.Label }";
            });
        }

        public List<DataSourceTable> GetDataSourceTables(string name)
        {
            var result = new List<DataSourceTable>();

            var dsConnection = _depDbContext.DataSourceConnections.FirstOrDefault(c => c.Name == name);

            using (var con = _serviceProvider.GetRequiredService<IDbConnection>())
            {
                con.ConnectionString = dsConnection.ConnectionString;

                var cmd = con.CreateCommand();
                cmd.Connection = con;
                cmd.CommandText = _queryBuilder.GetSqlTextForDatabaseTables();

                try
                {
                    con.Open();
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
                finally
                {
                    con.Close();
                }
            }

            return result.OrderBy(t => t.TableSchema).ThenBy(t => t.TableName).ToList();
        }

        public List<DataSourceTableColumn> GetDataSourceTableColumns(string name, string sqlText)
        {
            var result = new List<DataSourceTableColumn>();

            var dsConnection = _depDbContext.DataSourceConnections.FirstOrDefault(c => c.Name == name);

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
                    _logger.LogError(ex.Message, ex);
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
                    FilterType = "attachments",
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
                throw new ApiException("Not Found", 404);
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
                throw new ApiException("Not Found", 404);
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
                var sqlText = _queryBuilder.GetSqlTextForDatabaseSource(datasourceConfig);
                var columns = GetDataSourceTableColumns(datasourceConfig.DataSourceConnectionName, sqlText);
                return columns.Select(x => new GridColConfig()
                {
                    type = "DataBaseField",
                    field = x.ColumnName,
                    header = x.ColumnName,
                    width = 200,
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

            RemoveGridCache(config.Name);

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

            RemoveGridCache(config.Name);

            return true;
        }

        public List<CustomAction> GetCustomActions(Guid id)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new ApiException("Not Found", 404);
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
                throw new ApiException("Not Found", 404);
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
                throw new ApiException("Not Found", 404);
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
                throw new ApiException("Not Found", 404);
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

            var linkedTableNames = _depDbContext.SiteMenus.Where(x => x.ParentId == siteMenu.Id).Select(x => x.Name).ToList();
            if (linkedTableNames.Count > 0) _memoryCache.Remove($"grid.{linkedTableNames[0]}.linked.table.info");
            if (linkedTableNames.Count > 1) _memoryCache.Remove($"grid.{linkedTableNames[1]}.linked.table.info");

            return true;
        }

        private void RemoveGridCache(string name)
        {
            _memoryCache.Remove($"grid.{name}");
            _memoryCache.Remove($"grid.{name}.datasource");
            _memoryCache.Remove($"grid.{name}.attachment.cols");
        }

        public MemoryStream ExportPortalItem(Guid id)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id);
            if (siteMenu == null)
            {
                throw new ApiException("Not Found", 404);
            }

            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == siteMenu.Name);
            if (config == null) throw new Exception("Grid configuration does not exists with name: " + siteMenu.Name);


            var ds = _depDbContext.DataSourceConnections.FirstOrDefault(x => x.Name == config.DataSourceConnectionName);
            var menus = _depDbContext.SiteMenus.Where(x => x.Id == id || x.ParentId == id).OrderByDescending(x => x.ParentId).ToList();
            var configs = _depDbContext.UniversalGridConfigurations.Where(x => menus.Select(m => m.Name).Contains(x.Name)).ToList();
            var lookups = _depDbContext.Lookups.Where(x => configs.Select(c => c.Id).Contains(x.UniversalGridConfigurationId.Value)).ToList();

            var types = new List<string> { "View", "Add", "Edit", "Delete", "Export" };

            // get old permissions
            var permissionNames = new List<string>();
            menus.ForEach(m => permissionNames.AddRange(types.Select(t => $"{t}_{ m.Name.Replace("-", "_") }".ToUpper())));
            var permissions = _depDbContext.SitePermissions.Where(x => permissionNames.Contains(x.PermissionName)).ToList();

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
    }
}
