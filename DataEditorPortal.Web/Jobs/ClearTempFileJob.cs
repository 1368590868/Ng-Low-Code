using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Quartz;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace DataEditorPortal.Web.Jobs
{
    public class ClearTempFileJob : IJob
    {
        private readonly ILogger<ClearTempFileJob> _logger;
        private readonly IHostEnvironment _hostEnvironment;

        public ClearTempFileJob(
            ILogger<ClearTempFileJob> logger,
            IHostEnvironment hostEnvironment)
        {
            _logger = logger;
            _hostEnvironment = hostEnvironment;
        }

        public Task Execute(IJobExecutionContext context)
        {
            try
            {
                string tempFolder = Path.Combine(_hostEnvironment.ContentRootPath, "wwwroot\\FileUploadTemp");
                if (Directory.Exists(tempFolder))
                {
                    var dir = new DirectoryInfo(tempFolder);
                    var files = dir.GetFiles().Where(f => f.Exists && f.CreationTimeUtc.AddDays(10) < DateTime.UtcNow);
                    foreach (var file in files)
                    {
                        file.Delete();
                    }

                    _logger.LogInformation($"{files.Count()} files are deleted.");
                }

                return Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"ClearTempFileJob:{ex.Message}");
                return Task.FromException(ex);
            }
        }
    }
}
