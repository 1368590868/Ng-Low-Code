using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Models;
using DataEditorPortal.Web.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace DataEditorPortal.Web.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AttachmentController : ControllerBase
    {
        private readonly ILogger<AttachmentController> _logger;
        private readonly DepDbContext _depDbContext;
        private readonly IConfiguration _config;
        private readonly IHostEnvironment _hostEnvironment;
        private readonly IUniversalGridService _universalGridService;
        private readonly IMemoryCache _memoryCache;
        private readonly IAttachmentService _attachmentService;

        public AttachmentController(
            ILogger<AttachmentController> logger,
            DepDbContext depDbContext,
            IConfiguration config,
            IHostEnvironment hostEnvironment,
            IUniversalGridService universalGridService,
            IMemoryCache memoryCache,
            IAttachmentService attachmentService)
        {
            _logger = logger;
            _depDbContext = depDbContext;
            _config = config;
            _hostEnvironment = hostEnvironment;
            _universalGridService = universalGridService;
            _memoryCache = memoryCache;
            _attachmentService = attachmentService;
        }

        [HttpPost]
        [Route("upload-temp-file")]
        public List<UploadedFileModel> UploadTempFile([FromForm] UploadedFileInput model)
        {
            var result = new List<UploadedFileModel>();
            var files = model?.Files ?? new List<IFormFile>();
            try
            {
                string tempFolder = Path.Combine(_hostEnvironment.ContentRootPath, "App_Data\\FileUploadTemp");
                if (!Directory.Exists(tempFolder))
                {
                    Directory.CreateDirectory(tempFolder);
                }

                foreach (var file in files)
                {
                    string tempID = System.Guid.NewGuid().ToString();
                    if (file.Length > 0)
                    {
                        string filePath = Path.Combine(tempFolder, $"{tempID} - {file.FileName}");
                        using (Stream fileStream = new FileStream(filePath, FileMode.Create))
                        {
                            file.CopyTo(fileStream);
                            fileStream.Close();
                        }

                        result.Add(new UploadedFileModel()
                        {
                            FileId = tempID,
                            FileName = file.FileName,
                            ContentType = file.ContentType,
                            Status = Data.Common.UploadedFileStatus.New,
                            //FileUrl = $"/api/site/download-attachment/{tempID}/{file.FileName}"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                throw new DepException(ex.Message);
            }

            return result;
        }

        [HttpGet]
        [Route("download-temp-file/{fileId}/{fileName}")]
        public ActionResult DownloadTempFile(string fileId, string fileName)
        {
            try
            {
                string tempFolder = Path.Combine(_hostEnvironment.ContentRootPath, "App_Data\\FileUploadTemp");
                var filePath = Path.Combine(tempFolder, $"{fileId} - {fileName}");

                var stream = System.IO.File.OpenRead(filePath);

                return File(stream, "application/octet-stream", fileName);
            }
            catch (Exception e)
            {
                _logger.LogError(e, e.Message);
                return new ContentResult
                {
                    Content = "<h1 style='text-align:center'>File Not Found</h1><script>setTimeout(function(){window.close()}, 2000)</script>",
                    ContentType = "text/html",
                    StatusCode = 404
                };
            }
        }

        [HttpGet]
        [Route("download-file/{gridName}/{fieldName}/{fileId}/{fileName}")]
        public ActionResult DownloadFile(string gridName, string fieldName, string fileId)
        {
            try
            {
                var config = _memoryCache.GetOrCreate($"grid.{gridName}", entry =>
                {
                    entry.SetSlidingExpiration(TimeSpan.FromMinutes(30));
                    return _depDbContext.UniversalGridConfigurations.Include(x => x.DataSourceConnection).FirstOrDefault(x => x.Name == gridName);
                });

                var attachmentCols = _universalGridService.GetAttachmentCols(config);
                var fileUploadConfig = attachmentCols.FirstOrDefault(x => x.field.ToLower() == fieldName.ToLower()).fileUploadConfig;
                var result = _attachmentService.GetFileStream(fileId, fileUploadConfig);

                return File(result.stream, result.contentType, result.fileName);
            }
            catch (Exception e)
            {
                _logger.LogError(e, e.Message);
                return new ContentResult
                {
                    Content = "<h1 style='text-align:center'>File Not Found</h1><script>setTimeout(function(){window.close()}, 2000)</script>",
                    ContentType = "text/html",
                    StatusCode = 404
                };
            }
        }
    }
}
