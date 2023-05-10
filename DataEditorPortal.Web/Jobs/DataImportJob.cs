using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Models;
using DataEditorPortal.Web.Services;
using Microsoft.Extensions.Logging;
using Quartz;
using System;
using System.Collections.Generic;
using System.Linq;
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
            var uploadedFile = dataMap.Get("templateFile") as UploadedFileModel;
            var createdById = dataMap.GetGuid("createdById");
            if (!context.JobDetail.JobDataMap.Contains("progress"))
                context.JobDetail.JobDataMap.Add("progress", 0);

            var config = _depDbContext.UniversalGridConfigurations.FirstOrDefault(x => x.Name == gridName);
            if (config == null || uploadedFile == null) return Task.CompletedTask;

            // create data import entity
            var entity = new DataImportHistory();
            entity.Id = Guid.Parse(key.Name);
            entity.CreatedDate = DateTime.UtcNow;
            entity.Name = uploadedFile.FileName;
            entity.CreatedById = createdById;
            entity.Status = Data.Common.DataImportResult.InProgress;
            entity.GridConfigurationId = config.Id;
            _depDbContext.DataImportHistories.Add(entity);
            _depDbContext.SaveChanges();

            IList<IDictionary<string, object>> sourceObjs = null;
            var count = 0;
            try
            {
                sourceObjs = _importDataServcie.GetSourceData(uploadedFile);

                if (sourceObjs != null)
                {
                    // start to import, using grid service to add or update
                    foreach (var obj in sourceObjs)
                    {
                        _universalGridService.AddGridData(gridName, obj);
                        count++;

                        context.JobDetail.JobDataMap["progress"] = count / (double)sourceObjs.Count;
                    }
                }

                entity.Result = $"Import data successfully. {count} items imported.";
                entity.Status = Data.Common.DataImportResult.Complete;
                _depDbContext.SaveChanges();

                return Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError("DataImportJob", ex, ex.Message);

                entity.Result = $"Import data Failed. {count} items imported. \n Error: {ex.Message}";
                entity.Status = Data.Common.DataImportResult.Failed;
                _depDbContext.SaveChanges();

                return Task.FromException(ex);
            }
        }
    }
}
