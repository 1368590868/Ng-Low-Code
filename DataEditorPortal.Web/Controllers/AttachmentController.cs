using AutoWrapper.Filters;
using DataEditorPortal.Data.Common;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Models;
using DataEditorPortal.Web.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
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
        private readonly IServiceProvider _serviceProvider;

        public AttachmentController(
            ILogger<AttachmentController> logger,
            DepDbContext depDbContext,
            IConfiguration config,
            IHostEnvironment hostEnvironment,
            IServiceProvider serviceProvider)
        {
            _logger = logger;
            _depDbContext = depDbContext;
            _config = config;
            _hostEnvironment = hostEnvironment;
            _serviceProvider = serviceProvider;
        }

        [HttpPost]
        [Route("upload-temp-file")]
        public List<UploadedFileModel> UploadTempFile([FromForm] UploadedFileInput model)
        {
            var result = new List<UploadedFileModel>();
            var files = model?.Files ?? new List<IFormFile>();
            try
            {
                string tempFolder = Path.Combine(_hostEnvironment.ContentRootPath, "wwwroot\\FileUploadTemp");
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
                _logger.LogError(ex.Message, ex);
                throw new DepException(ex.Message);
            }

            return result;
        }

        [HttpGet]
        [Route("download-temp-file/{fileId}/{fileName}")]
        [AutoWrapIgnore]
        public ActionResult DownloadTempFile(string fileId, string fileName)
        {
            string tempFolder = Path.Combine(_hostEnvironment.ContentRootPath, "wwwroot\\FileUploadTemp");
            var filePath = Path.Combine(tempFolder, $"{fileId} - {fileName}");
            if (System.IO.File.Exists(filePath))
            {
                if (System.IO.File.Exists(filePath))
                {
                    var stream = System.IO.File.OpenRead(filePath);

                    return File(stream, "application/octet-stream", fileName);
                }
            }
            return new ContentResult
            {
                Content = "<h1 style='text-align:center'>File Not Found</h1><script>setTimeout(function(){window.close()}, 2000)</script>",
                ContentType = "text/html",
                StatusCode = 404
            };
        }

        [HttpGet]
        [Route("download-file/{fileId}/{fileName}")]
        [AutoWrapIgnore]
        public ActionResult DownloadFile(string fileId)
        {
            var uploadedFile = _depDbContext.UploadedFiles.FirstOrDefault(x => x.Id == fileId);
            if (uploadedFile == null)
                return new ContentResult
                {
                    Content = "<h1 style='text-align:center'>File Not Found</h1><script>setTimeout(function(){window.close()}, 2000)</script>",
                    ContentType = "text/html",
                    StatusCode = 404
                };

            var fileStorageService = GetFileStorageService(uploadedFile.StorageType);
            var stream = fileStorageService.GetFileStream(uploadedFile.Id);
            return File(
                stream,
                string.IsNullOrEmpty(uploadedFile.ContentType) ? "application/octet-stream" : uploadedFile.ContentType,
                uploadedFile.FileName
            );
        }

        private IFileStorageService GetFileStorageService(FileStorageType type)
        {
            switch (type)
            {
                case FileStorageType.FileSystem:
                    return _serviceProvider.GetRequiredService<PhsicalFileStorageService>();
                case FileStorageType.SqlBinary:
                    return _serviceProvider.GetRequiredService<BinaryFileStorageService>();
                default:
                    return _serviceProvider.GetRequiredService<PhsicalFileStorageService>();
            }
        }
    }
}
