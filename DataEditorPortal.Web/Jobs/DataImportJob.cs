using DataEditorPortal.Data.Common;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Models;
using DataEditorPortal.Web.Models.UniversalGrid;
using DataEditorPortal.Web.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Quartz;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;

namespace DataEditorPortal.Web.Jobs
{
    public class DataImportJob : IJob
    {
        private readonly ILogger<DataImportJob> _logger;
        private readonly DepDbContext _depDbContext;
        private readonly IServiceProvider _serviceProvider;

        public DataImportJob(
            ILogger<DataImportJob> logger,
            DepDbContext depDbContext,
            IServiceProvider serviceProvider)
        {
            _logger = logger;
            _depDbContext = depDbContext;
            _serviceProvider = serviceProvider;
        }

        public Task Execute(IJobExecutionContext context)
        {
            JobKey key = context.JobDetail.Key;
            JobDataMap dataMap = context.MergedJobDataMap;

            var gridName = dataMap.GetString("gridName");
            var importType = (ActionType)dataMap.Get("importType");
            var uploadedFile = dataMap.Get("templateFile") as UploadedFileModel;
            var createdById = dataMap.GetGuid("createdById");
            var createdByName = dataMap.GetString("createdByName");
            if (!context.JobDetail.JobDataMap.Contains("progress"))
                context.JobDetail.JobDataMap.Add("progress", 0);

            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == gridName);
            if (config == null || uploadedFile == null) return Task.CompletedTask;

            var dataSourceConfig = JsonSerializer.Deserialize<DataSourceConfig>(config.DataSourceConfig);
            var idColumn = dataSourceConfig.IdColumn;

            // create data import entity
            var entity = new DataImportHistory();
            entity.Id = Guid.Parse(key.Name);
            entity.CreatedDate = DateTime.UtcNow;
            entity.Name = uploadedFile.FileName;
            entity.CreatedById = createdById;
            entity.Status = DataImportResult.InProgress;
            entity.GridConfigurationId = config.Id;
            entity.ImportType = importType;
            _depDbContext.DataImportHistories.Add(entity);
            _depDbContext.SaveChanges();

            var countImported = 0;
            try
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var claims = new List<Claim> {
                        new Claim(DepClaimConstants.DisplayName, createdByName),
                        new Claim(DepClaimConstants.UserId, createdById.ToString())
                    };
                    var identity = new ClaimsIdentity(claims, "custom", ClaimsIdentity.DefaultNameClaimType, ClaimsIdentity.DefaultRoleClaimType);
                    var principal = new ClaimsPrincipal(identity);
                    var currentUserAccessor = scope.ServiceProvider.GetRequiredService<ICurrentUserAccessor>();
                    currentUserAccessor.SetCurrentUser(principal);

                    var _universalGridService = scope.ServiceProvider.GetRequiredService<IUniversalGridService>();
                    var _importDataServcie = scope.ServiceProvider.GetRequiredService<IImportDataServcie>();

                    var sourceObjs = _importDataServcie.GetTransformedSourceData(gridName, importType, uploadedFile);
                    var totalCount = (double)sourceObjs.Count();
                    if (sourceObjs != null)
                    {
                        // start to import, using grid service to add or update
                        foreach (var obj in sourceObjs)
                        {
                            if (importType == ActionType.Add) _universalGridService.AddGridData(gridName, obj);
                            if (importType == ActionType.Update) _universalGridService.UpdateGridData(gridName, obj[idColumn].ToString(), obj);

                            countImported++;

                            context.JobDetail.JobDataMap["progress"] = countImported / totalCount * 100;
                        }
                    }
                }

                entity.Result = $"Import process has been successfully completed. {countImported} items imported.";
                entity.Status = Data.Common.DataImportResult.Complete;
                _depDbContext.SaveChanges();

                return Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"DataImportJob:{ex.Message}");

                entity.Result = $"Import process has been stopped. {countImported} items imported. \n Error: {ex.Message}";
                entity.Status = Data.Common.DataImportResult.Failed;
                _depDbContext.SaveChanges();

                return Task.FromException(ex);
            }
        }
    }
}
