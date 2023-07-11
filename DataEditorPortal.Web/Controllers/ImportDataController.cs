using AutoMapper;
using DataEditorPortal.Data.Common;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Jobs;
using DataEditorPortal.Web.Models;
using DataEditorPortal.Web.Models.ImportData;
using DataEditorPortal.Web.Models.UniversalGrid;
using DataEditorPortal.Web.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Quartz;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace DataEditorPortal.Web.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/import-data")]
    public class ImportDataController : ControllerBase
    {
        private readonly ILogger<ImportDataController> _logger;
        private readonly DepDbContext _depDbContext;
        private readonly IUniversalGridService _universalGridService;
        private readonly IImportDataServcie _importDataServcie;
        private readonly IMapper _mapper;
        private readonly ISchedulerFactory _schedulerFactory;

        public ImportDataController(
            ILogger<ImportDataController> logger,
            DepDbContext depDbContext,
            IUniversalGridService universalGridService,
            IImportDataServcie importDataServcie,
            IMapper mapper,
            ISchedulerFactory schedulerFactory)
        {
            _logger = logger;
            _depDbContext = depDbContext;
            _universalGridService = universalGridService;
            _importDataServcie = importDataServcie;
            _mapper = mapper;
            _schedulerFactory = schedulerFactory;
        }

        [HttpGet]
        [Route("{gridName}/histories")]
        public List<ImportHistoryModel> GetDataImportHistory(string gridName)
        {
            var list = _depDbContext.DataImportHistories
                .Include(x => x.CreatedBy)
                .Where(x => x.GridConfiguration.Name == gridName)
                .OrderByDescending(x => x.CreatedDate)
                .ToList();

            return _mapper.Map<List<ImportHistoryModel>>(list);
        }

        [HttpGet]
        [Route("{gridName}/{id}/import-status")]
        public async Task<ImportHistoryModel> GetImportStatus(string gridName, Guid id)
        {
            var entity = _depDbContext.DataImportHistories
                .Include(x => x.CreatedBy)
                .Where(x => x.GridConfiguration.Name == gridName)
                .Where(x => x.Id == id)
                .FirstOrDefault();

            if (entity == null) throw new DepException("Not Found", 404);

            var item = _mapper.Map<ImportHistoryModel>(entity);
            if (entity.Status == Data.Common.DataImportResult.InProgress)
            {
                var scheduler = await _schedulerFactory.GetScheduler().ConfigureAwait(true);
                var jobs = await scheduler.GetCurrentlyExecutingJobs().ConfigureAwait(true);
                var job = jobs.FirstOrDefault(x => x.JobDetail.Key.Name == item.Id.ToString());

                if (job == null)
                {
                    entity.Status = Data.Common.DataImportResult.Failed;
                    entity.Result = "Import failed. Background job has been canceled.";
                    _depDbContext.SaveChanges();

                    item = _mapper.Map<ImportHistoryModel>(entity);
                }
                else
                {
                    item.Progress = job.JobDetail.JobDataMap.GetDouble("progress");
                }
            }
            else
            {
                item.Progress = 100;
            }

            return item;
        }

        [HttpPost]
        [Route("{gridName}/{type}/upload-excel-template")]
        public dynamic UploadExcelTemplate(string gridName, ImportType type, [FromBody] UploadedFileModel uploadedFile)
        {
            var sourceObjs = _importDataServcie.GetSourceData(gridName, type, uploadedFile);

            IList<FormFieldConfig> fields = null;
            if (sourceObjs != null)
            {
                fields = _importDataServcie.ValidateImportedData(gridName, type, sourceObjs);
            }

            var result = new
            {
                Data = sourceObjs.ToList(),
                fields = fields.Select(f => new { f.key, f.filterType, f.props }),
            };
            return result;
        }

        [HttpPost]
        [Route("{gridName}/{type}/confirm-import")]
        public void ConfirmImport(string gridName, ImportType type, [FromBody] UploadedFileModel uploadedFile)
        {
            var username = AppUser.ParseUsername(User.Identity.Name).Username;
            var currentUserId = _depDbContext.Users.FirstOrDefault(x => x.Username == username).Id;

            var jobDataMap = new JobDataMap();
            jobDataMap.Add("gridName", gridName);
            jobDataMap.Add("importType", type);
            jobDataMap.Add("templateFile", uploadedFile);
            jobDataMap.Add("createdById", currentUserId);
            jobDataMap.Add("createdByName", username);

            var jobName = Guid.NewGuid().ToString();
            var job = JobBuilder.Create<DataImportJob>()
                        .WithIdentity(jobName)
                        .UsingJobData(jobDataMap)
                        .Build();

            var trigger = TriggerBuilder.Create()
                .WithIdentity(jobName)
                .StartNow()
                .Build();

            var scheduler = _schedulerFactory.GetScheduler().Result;
            scheduler.ScheduleJob(job, trigger);
        }

        [HttpGet]
        [Route("{gridName}/{type}/download-template")]
        public IActionResult DownloadTemplate(string gridName, ImportType type)
        {
            var fs = _importDataServcie.GenerateImportTemplate(gridName, type);

            return File(fs, "application/ms-excel", $"{gridName}_import_template.xlsx");
        }
    }
}
