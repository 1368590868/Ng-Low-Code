using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Models;
using Microsoft.Extensions.Hosting;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace DataEditorPortal.Web.Services
{
    public class PhsicalFileStorageService : IFileStorageService
    {
        private readonly DepDbContext _depDbContext;
        private readonly IHostEnvironment _hostEnvironment;
        public PhsicalFileStorageService(IHostEnvironment hostEnvironment, DepDbContext depDbContext)
        {
            _hostEnvironment = hostEnvironment;
            _depDbContext = depDbContext;
        }

        public List<string> SaveFiles(List<UploadedFileModel> uploadedFiles, string gridName)
        {
            var tempFiles = new List<string>();
            foreach (var uploadedFile in uploadedFiles)
            {
                if (uploadedFile.Status == Data.Common.UploadedFileStatus.New)
                {
                    string tempFolder = Path.Combine(_hostEnvironment.ContentRootPath, "wwwroot/FileUploadTemp");
                    var tempFilePath = Path.Combine(tempFolder, $"{uploadedFile.FileId} - {uploadedFile.FileName}");

                    string targetFolder = Path.Combine(_hostEnvironment.ContentRootPath, $"wwwroot\\Attachements\\{gridName}");
                    if (!Directory.Exists(targetFolder)) Directory.CreateDirectory(targetFolder);
                    var destFilePath = Path.Combine(targetFolder, $"{uploadedFile.FileId} - {uploadedFile.FileName}");

                    File.Copy(tempFilePath, destFilePath, true);

                    var entity = new UploadedFile();
                    entity.Id = uploadedFile.FileId;
                    entity.ContentType = uploadedFile.ContentType;
                    entity.Status = Data.Common.UploadedFileStatus.Current;
                    entity.FileName = uploadedFile.FileName;
                    entity.FilePath = destFilePath;
                    entity.StorageType = Data.Common.FileStorageType.FileSystem;
                    _depDbContext.UploadedFiles.Add(entity);

                    tempFiles.Add(tempFilePath);
                }
                else
                {
                    var entity = _depDbContext.UploadedFiles.FirstOrDefault(x => x.Id == uploadedFile.FileId);
                    entity.Status = uploadedFile.Status;
                }
            }

            _depDbContext.SaveChanges();

            tempFiles.ForEach(x => File.Delete(x));

            return uploadedFiles.Select(x => x.FileId).ToList();
        }

        public Stream GetFileStream(string fileId)
        {
            var uploadedFile = _depDbContext.UploadedFiles.FirstOrDefault(x => x.Id == fileId);
            if (uploadedFile == null) throw new DepException($"File [{fileId}] doesn't exist.");

            return File.OpenRead(uploadedFile.FilePath);
        }
    }
}
