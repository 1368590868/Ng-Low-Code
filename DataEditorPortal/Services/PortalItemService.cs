using AutoMapper;
using AutoWrapper.Wrappers;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Models;
using DataEditorPortal.Web.Models.PortalItem;
using DataEditorPortal.Web.Models.UniversalGrid;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace DataEditorPortal.Web.Services
{
    public interface IPortalItemService
    {
        string GetCodeName(string name);
        bool ExistName(string name, Guid? id);
        Guid Create(PortalItemData model);
        Guid Update(Guid id, PortalItemData model);
        List<DataSourceTable> GetDataSourceTables();
        List<DataSourceTableColumn> GetDataSourceTableColumns(string sqlText);
        List<DataSourceTableColumn> GetDataSourceTableColumns(Guid id);
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
    }

    public class PortalItemService : IPortalItemService
    {
        private readonly DepDbContext _depDbContext;
        private readonly IDbSqlBuilder _dbSqlBuilder;
        private readonly ILogger<PortalItemService> _logger;
        private readonly IMapper _mapper;
        private IHttpContextAccessor _httpContextAccessor;

        public PortalItemService(
            DepDbContext depDbContext,
            IDbSqlBuilder dbSqlBuilder,
            ILogger<PortalItemService> logger,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor)
        {
            _depDbContext = depDbContext;
            _dbSqlBuilder = dbSqlBuilder;
            _logger = logger;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
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
            model.Name = GetCodeName(model.Label);

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
            siteMenu.Type = "Portal Item";

            _depDbContext.SiteMenus.Add(siteMenu);

            // create universal grid configuration
            var item = new UniversalGridConfiguration();
            item.Name = siteMenu.Name;
            item.CreatedBy = userId;
            item.CreatedDate = DateTime.UtcNow;

            _depDbContext.UniversalGridConfigurations.Add(item);

            // create permissions
            var types = new List<string> { "View", "Add", "Edit", "Delete", "Export" };
            types.ForEach(t =>
            {
                var permission = new SitePermission()
                {
                    Id = Guid.NewGuid(),
                    Category = $"Portal Item: { model.Label }",
                    PermissionName = $"{t}_{ model.Name.Replace("-", "_") }".ToUpper(),
                    PermissionDescription = $"{t} { model.Label }"
                };
                _depDbContext.Add(permission);
            });

            _depDbContext.SaveChanges();

            return siteMenu.Id;
        }

        public Guid Update(Guid id, PortalItemData model)
        {
            var siteMenu = _depDbContext.SiteMenus.FirstOrDefault(x => x.Id == id && x.Type == "Portal Item");
            if (siteMenu == null)
            {
                throw new ApiException("Not Found", 404);
            }

            model.Name = GetCodeName(model.Label);

            // update permissions
            var permissions = _depDbContext.SitePermissions.Where(x => x.Category == $"Portal Item: { siteMenu.Label }").ToList();

            permissions.ForEach(p =>
            {
                p.Category = p.Category.Replace(siteMenu.Label, model.Label);
                p.PermissionName = p.PermissionName.Replace(siteMenu.Name.Replace("-", "_").ToUpper(), model.Name.Replace("-", "_").ToUpper());
                p.PermissionDescription = p.PermissionDescription.Replace(siteMenu.Label, model.Label);
            });

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
            siteMenu.Type = "Portal Item";

            _depDbContext.SaveChanges();
            return siteMenu.Id;
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

        public List<DataSourceTableColumn> GetDataSourceTableColumns(string sqlText)
        {
            var result = new List<DataSourceTableColumn>();

            var con = _depDbContext.Database.GetDbConnection();
            con.Open();
            var cmd = con.CreateCommand();
            cmd.Connection = con;
            cmd.CommandText = sqlText;

            try
            {
                using (var dr = cmd.ExecuteReader(CommandBehavior.SchemaOnly))
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
            finally
            {
                con.Close();
            }

            return result;
        }

        public List<DataSourceTableColumn> GetDataSourceTableColumns(Guid id)
        {
            var datasourceConfig = GetDataSourceConfig(id);
            if (datasourceConfig == null)
                throw new DepException("DataSource Config is empty for Portal Item: " + id);

            return GetDataSourceTableColumns(_dbSqlBuilder.GetSqlTextForDatabaseSource(datasourceConfig));
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
                var columns = GetDataSourceTableColumns(_dbSqlBuilder.GetSqlTextForDatabaseSource(datasourceConfig));
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

            return true;
        }
    }
}
