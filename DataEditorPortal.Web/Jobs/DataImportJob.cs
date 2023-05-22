using DataEditorPortal.Data.Common;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Models;
using DataEditorPortal.Web.Models.UniversalGrid;
using DataEditorPortal.Web.Services;
using Microsoft.Extensions.Logging;
using Quartz;
using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace DataEditorPortal.Web.Jobs
{
    public class DataImportJob : IJob
    {
        private readonly ILogger<DataImportJob> _logger;
        private readonly DepDbContext _depDbContext;
        private readonly IUniversalGridService _universalGridService;
        private readonly IImportDataServcie _importDataServcie;

        public DataImportJob(
            ILogger<DataImportJob> logger,
            DepDbContext depDbContext,
            IUniversalGridService universalGridService,
            IImportDataServcie importDataServcie)
        {
            _logger = logger;
            _depDbContext = depDbContext;
            _universalGridService = universalGridService;
            _importDataServcie = importDataServcie;
        }

        public Task Execute(IJobExecutionContext context)
        {
            JobKey key = context.JobDetail.Key;
            JobDataMap dataMap = context.MergedJobDataMap;

            var gridName = dataMap.GetString("gridName");
            var importType = (ImportType)dataMap.Get("importType");
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
                var sourceObjs = _importDataServcie.GetTransformedSourceData(gridName, importType, uploadedFile);
                var totalCount = (double)sourceObjs.Count();
                if (sourceObjs != null)
                {
                    _universalGridService.CurrentUsername = createdByName;

                    // start to import, using grid service to add or update
                    foreach (var obj in sourceObjs)
                    {
                        if (importType == ImportType.Add) _universalGridService.AddGridData(gridName, obj);
                        if (importType == ImportType.Update) _universalGridService.UpdateGridData(gridName, obj[idColumn].ToString(), obj);

                        countImported++;

                        context.JobDetail.JobDataMap["progress"] = countImported / totalCount * 100;
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
