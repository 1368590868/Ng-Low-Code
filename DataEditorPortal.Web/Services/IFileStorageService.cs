using DataEditorPortal.Web.Models;
using System.Collections.Generic;
using System.IO;

namespace DataEditorPortal.Web.Services
{
    public interface IFileStorageService
    {
        List<string> SaveFiles(List<UploadedFileModel> model, string gridName);
        Stream GetFileStream(string fileId);
    }
}
