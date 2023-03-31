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
    public class BinaryFileStorageService : IFileStorageService
    {
        private readonly DepDbContext _depDbContext;
        private readonly IHostEnvironment _hostEnvironment;
        public BinaryFileStorageService(IHostEnvironment hostEnvironment, DepDbContext depDbContext)
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

                    var entity = new UploadedFile();
                    entity.Id = uploadedFile.FileId;
                    entity.ContentType = uploadedFile.ContentType;
                    entity.Status = Data.Common.UploadedFileStatus.Current;
                    entity.FileName = uploadedFile.FileName;
                    entity.FileBytes = File.ReadAllBytes(tempFilePath);
                    entity.StorageType = Data.Common.FileStorageType.SqlBinary;
                    entity.Comments = uploadedFile.Comments;
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

            var stream = new MemoryStream(uploadedFile.FileBytes);
            stream.Position = 0;
            return stream;
        }
    }
}
