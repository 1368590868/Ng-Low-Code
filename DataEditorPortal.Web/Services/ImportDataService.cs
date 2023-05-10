using AutoMapper;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Models;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using OfficeOpenXml;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;

namespace DataEditorPortal.Web.Services
{
    public interface IImportDataServcie
    {
        public IList<IDictionary<string, object>> GetSourceData(UploadedFileModel uploadedFile);
    }

    public class ImportDataService : IImportDataServcie
    {
        private readonly ILogger<ImportDataService> _logger;
        private readonly DepDbContext _depDbContext;
        private readonly IHostEnvironment _hostEnvironment;
        private readonly IUniversalGridService _universalGridService;
        private readonly IMapper _mapper;

        public ImportDataService(
            ILogger<ImportDataService> logger,
            DepDbContext depDbContext,
            IHostEnvironment hostEnvironment,
            IUniversalGridService universalGridService,
            IMapper mapper)
        {
            _logger = logger;
            _depDbContext = depDbContext;
            _hostEnvironment = hostEnvironment;
            _universalGridService = universalGridService;
            _mapper = mapper;
        }

        public IList<IDictionary<string, object>> GetSourceData(UploadedFileModel uploadedFile)
        {
            string tempFolder = Path.Combine(_hostEnvironment.ContentRootPath, "wwwroot/FileUploadTemp");
            var tempFilePath = Path.Combine(tempFolder, $"{uploadedFile.FileId} - {uploadedFile.FileName}");
            if (!System.IO.File.Exists(tempFilePath)) throw new DepException("Uploaded File doesn't exist.");

            IList<IDictionary<string, object>> sourceObjs = null;
            using (var stream = System.IO.File.OpenRead(tempFilePath))
            {
                using (var package = new ExcelPackage(stream))
                {
                    if (package.Workbook != null && package.Workbook.Worksheets.Any())
                    {
                        var worksheet = package.Workbook.Worksheets[0];
                        var dt = worksheet.Cells[worksheet.Dimension.Address].ToDataTable();
                        sourceObjs = GetDataTableDictionaryList(dt).ToList();
                    }
                    else
                    {
                        throw new DepException("The uploaded excel should have at least one worksheet.");
                    }
                }
            }

            return sourceObjs;
        }

        private IEnumerable<IDictionary<string, object>> GetDataTableDictionaryList(DataTable dt)
        {
            return dt.AsEnumerable().Select(
                row => dt.Columns.Cast<DataColumn>().ToDictionary(
                    column => column.ColumnName,
                    column => row[column]
                ));
        }

    }
}
