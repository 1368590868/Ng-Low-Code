using Dapper;
using DataEditorPortal.Data.Common;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Models;
using DataEditorPortal.Web.Models.UniversalGrid;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;

namespace DataEditorPortal.Web.Services
{
    public interface IAttachmentService
    {
        FileUploadConfig GetDefaultConfig();
        void SaveUploadedFiles(UploadedFileMeta uploadedFileMeta, IDictionary<string, object> model, string gridName, IDbConnection con, IDbTransaction trans);
        dynamic GetFileStream(string fileId, FileUploadConfig options);
    }

    public class AttachmentService : IAttachmentService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly IHostEnvironment _hostEnvironment;
        private readonly IQueryBuilder _queryBuilder;
        private readonly DepDbContext _depDbContext;
        private readonly IHttpContextAccessor _httpContextAccessor;

        private FileUploadConfig DEFAULT_CONFIG = new FileUploadConfig()
        {
            DataSourceConnectionName = Constants.DEFAULT_CONNECTION_NAME,
            TableName = "UPLOADED_FILE",
            TableSchema = Constants.DEFAULT_SCHEMA,
            FieldMapping = new Dictionary<string, string>() {
                { "ID", "ID" },
                { "CONTENT_TYPE", "CONTENT_TYPE" },
                { "FILE_NAME", "FILE_NAME" },
                { "FILE_BYTES", "FILE_BYTES" },
                { "FILE_PATH", "FILE_PATH" },
                { "COMMENTS", "COMMENTS" },
                { "STATUS", "STATUS" },
                { "FOREIGN_KEY", "DATA_ID" }
            }
        };

        public string CurrentUsername { get; set; }

        public AttachmentService(
            IHostEnvironment hostEnvironment,
            IServiceProvider serviceProvider,
            IQueryBuilder queryBuilder,
            DepDbContext depDbContext,
            IHttpContextAccessor httpContextAccessor)
        {
            _hostEnvironment = hostEnvironment;
            _serviceProvider = serviceProvider;
            _queryBuilder = queryBuilder;
            _depDbContext = depDbContext;
            _httpContextAccessor = httpContextAccessor;

            if (_httpContextAccessor.HttpContext != null && _httpContextAccessor.HttpContext.User != null)
                CurrentUsername = AppUser.ParseUsername(_httpContextAccessor.HttpContext.User.Identity.Name).Username;
        }

        public FileUploadConfig GetDefaultConfig()
        {
            return DEFAULT_CONFIG;
        }
        public void SaveUploadedFiles(UploadedFileMeta uploadedFileMeta, IDictionary<string, object> model, string gridName, IDbConnection con, IDbTransaction trans)
        {
            var config = GetConfigOrDefault(uploadedFileMeta);
            var storageType = config.FileStorageType;

            var targetFolder = string.Empty;
            if (storageType == FileStorageType.FileSystem)
            {
                targetFolder = EnsureTargetFolder(config, gridName);
            }

            var insertScript = GetInsertScript(config);
            var updateScript = GetUpdateScript(config);

            List<object> insertParameters = new List<object>();
            List<object> updateParameters = new List<object>();
            var tempFiles = new List<string>();
            foreach (var uploadedFile in uploadedFileMeta.UploadedFiles)
            {
                if (uploadedFile.Status == Data.Common.UploadedFileStatus.New)
                {
                    #region process file

                    string tempFolder = Path.Combine(_hostEnvironment.ContentRootPath, "App_Data\\FileUploadTemp");
                    var tempFilePath = Path.Combine(tempFolder, $"{uploadedFile.FileId} - {uploadedFile.FileName}");
                    tempFiles.Add(tempFilePath);

                    var value = new List<KeyValuePair<string, object>>();
                    if (storageType == FileStorageType.FileSystem)
                    {
                        var destFilePath = EnsureFilePath(targetFolder, uploadedFile.FileName);
                        uploadedFile.FileName = Path.GetFileName(destFilePath);

                        File.Copy(tempFilePath, destFilePath, true);

                        if (!string.IsNullOrEmpty(config.GetMappedColumn("FILE_PATH")))
                            value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("FILE_PATH"), destFilePath));
                    }
                    else if (storageType == FileStorageType.SqlBinary)
                    {
                        value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("FILE_BYTES"), File.ReadAllBytes(tempFilePath)));
                    }

                    #endregion

                    // FILE ID and DATA ID
                    value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("ID"), uploadedFile.FileId));
                    var referenceDataKey = config.GetMappedColumn("REFERENCE_DATA_KEY");
                    value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("FOREIGN_KEY"), model[referenceDataKey]));

                    // FILE NAME and STATUS
                    value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("FILE_NAME"), uploadedFile.FileName));
                    value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("STATUS"), GetStatusMapValue(UploadedFileStatus.Current)));

                    // Optional pre-defined fields
                    if (!string.IsNullOrEmpty(config.GetMappedColumn("CONTENT_TYPE")))
                        value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("CONTENT_TYPE"), uploadedFile.ContentType));
                    if (!string.IsNullOrEmpty(config.GetMappedColumn("COMMENTS")))
                        value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("COMMENTS"), uploadedFile.Comments));
                    if (!string.IsNullOrEmpty(config.GetMappedColumn("CREATED_DATE")))
                        value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("CREATED_DATE"), DateTime.UtcNow));
                    if (!string.IsNullOrEmpty(config.GetMappedColumn("CREATED_BY")))
                        value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("CREATED_BY"), CurrentUsername));

                    // Custom Optional Fields
                    if (config.CustomFields != null)
                    {
                        foreach (var mapping in config.CustomFields)
                        {
                            var key = mapping.Value;
                            var data = model.ContainsKey(key) ? model[key] : null;
                            if (!string.IsNullOrEmpty(key) && data != null)
                                value.Add(new KeyValuePair<string, object>(mapping.Value, model[mapping.Key]));
                        }
                    }

                    insertParameters.Add(_queryBuilder.GenerateDynamicParameter(value));
                }
                else
                {
                    var value = new List<KeyValuePair<string, object>>();
                    value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("ID"), uploadedFile.FileId));
                    value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("STATUS"), GetStatusMapValue(uploadedFile.Status)));
                    if (!string.IsNullOrEmpty(config.GetMappedColumn("MODIFIED_DATE")))
                        value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("MODIFIED_DATE"), DateTime.UtcNow));
                    if (!string.IsNullOrEmpty(config.GetMappedColumn("MODIFIED_BY")))
                        value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("MODIFIED_BY"), CurrentUsername));

                    if (!string.IsNullOrEmpty(config.GetMappedColumn("COMMENTS")))
                        value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("COMMENTS"), uploadedFile.Comments));

                    updateParameters.Add(_queryBuilder.GenerateDynamicParameter(value));
                }
            }


            if (insertParameters.Any())
                con.Execute(insertScript, insertParameters, trans);
            if (updateParameters.Any())
                con.Execute(updateScript, updateParameters, trans);

            try
            {
                // if the file is not deleted successfully, we have scheduler job to clear it.
                tempFiles.ForEach(x => File.Delete(x));
            }
            catch
            { }
        }

        public dynamic GetFileStream(string fileId, FileUploadConfig config)
        {
            if (config == null) config = DEFAULT_CONFIG;
            var storageType = config.FileStorageType;
            var fileByteColumn = config.GetMappedColumn("FILE_BYTES");
            var filePathColumn = config.GetMappedColumn("FILE_PATH");
            var fileNameColumn = config.GetMappedColumn("FILE_NAME");
            var contentTypeColumn = config.GetMappedColumn("CONTENT_TYPE");
            var idColumn = config.GetMappedColumn("ID");

            // check strogeType
            List<string> fields = new List<string>() { fileNameColumn };
            if (!string.IsNullOrEmpty(contentTypeColumn)) fields.Add(contentTypeColumn);
            if (storageType == FileStorageType.FileSystem)
            {
                if (!string.IsNullOrEmpty(filePathColumn)) fields.Add(filePathColumn);
            }
            else if (storageType == FileStorageType.SqlBinary)
            {
                if (!string.IsNullOrEmpty(fileByteColumn)) fields.Add(fileByteColumn);
            }

            var columns = string.Join(",", fields);
            var queryScript = _queryBuilder.ReplaceQueryParamters(
                $"SELECT {columns} FROM {config.TableSchema}.{config.TableName} WHERE {idColumn}=##{idColumn}##"
            );
            var value = new List<KeyValuePair<string, object>>();
            value.Add(new KeyValuePair<string, object>(idColumn, fileId));
            var param = _queryBuilder.GenerateDynamicParameter(value);

            string fileName = null;
            string contentType = null;
            Stream stream = null;

            var dsConnection = _depDbContext.DataSourceConnections.FirstOrDefault(x => x.Name == config.DataSourceConnectionName);
            using (var con = _serviceProvider.GetRequiredService<IDbConnection>())
            {
                con.ConnectionString = dsConnection.ConnectionString;
                var uploadedFile = con.QueryFirst(queryScript, param);
                if (uploadedFile == null) throw new DepException($"File [{fileId}] doesn't exist.");

                fileName = (string)(uploadedFile as IDictionary<string, object>)[fileNameColumn];
                if (!string.IsNullOrEmpty(contentTypeColumn))
                    contentType = (string)(uploadedFile as IDictionary<string, object>)[contentTypeColumn];

                if (storageType == FileStorageType.FileSystem)
                {
                    if (!string.IsNullOrEmpty(filePathColumn))
                        stream = File.OpenRead((string)(uploadedFile as IDictionary<string, object>)[filePathColumn]);
                    else
                        stream = File.OpenRead(Path.Combine(config.BasePath, fileName));
                }
                else
                {
                    byte[] fileBytes = (byte[])(uploadedFile as IDictionary<string, object>)[fileByteColumn];
                    new MemoryStream(fileBytes);
                    stream.Position = 0;
                }
            }

            return new
            {
                stream,
                contentType = string.IsNullOrEmpty(contentType) ? "application/octet-stream" : contentType,
                fileName
            };
        }

        private string GetInsertScript(FileUploadConfig config)
        {
            if (config == null) config = DEFAULT_CONFIG;
            var storageType = config.FileStorageType;

            var fieldMapping = config.FieldMapping
                .Where(x => x.Key != "REFERENCE_DATA_KEY" && x.Key != "MODIFIED_DATE" && x.Key != "MODIFIED_BY" && x.Key != (storageType == FileStorageType.FileSystem ? "FILE_BYTES" : "FILE_PATH"))
                .Where(x => !string.IsNullOrEmpty(x.Value))
                .Select(x => x.Value);

            var columns = string.Join(",", fieldMapping);
            var parameters = string.Join(",", fieldMapping.Select(x => $"##{x}##"));
            return _queryBuilder.GenerateSqlTextForInsert(new DataSourceConfig()
            {
                QueryText = $"INSERT INTO {config.TableSchema}.{config.TableName} ({columns}) VALUES ({parameters})"
            });
        }

        private string GetUpdateScript(FileUploadConfig config)
        {
            if (config == null) config = DEFAULT_CONFIG;

            var columns = config.FieldMapping
                .Where(x => x.Key == "COMMENTS" || x.Key == "STATUS" || x.Key == "MODIFIED_DATE" || x.Key == "MODIFIED_BY")
                .Where(x => !string.IsNullOrEmpty(x.Value))
                .Select(x => x.Value);

            var idColumn = config.GetMappedColumn("ID");

            var sets = string.Join(",", columns.Select(x => $"{x}=##{x}##"));
            return _queryBuilder.GenerateSqlTextForInsert(new DataSourceConfig()
            {
                QueryText = $"UPDATE {config.TableSchema}.{config.TableName} SET {sets} WHERE {idColumn}=##{idColumn}##"
            });
        }

        private FileUploadConfig GetConfigOrDefault(UploadedFileMeta meta)
        {
            var config = meta.FileUploadConfig;
            if (config == null)
                config = DEFAULT_CONFIG;
            return config;
        }

        private string EnsureTargetFolder(FileUploadConfig config, string gridName)
        {
            string targetFolder;
            if (!string.IsNullOrEmpty(config.BasePath))
                targetFolder = Path.Combine(_hostEnvironment.ContentRootPath, config.BasePath);
            else targetFolder = Path.Combine(_hostEnvironment.ContentRootPath, $"App_Data\\Attachements\\{gridName}");
            if (!Directory.Exists(targetFolder)) Directory.CreateDirectory(targetFolder);

            return targetFolder;
        }

        private string EnsureFilePath(string targetFolder, string fileName)
        {
            string filePath = Path.Combine(targetFolder, fileName);
            string ext = Path.GetExtension(filePath);
            var name = Path.GetFileNameWithoutExtension(filePath);

            if (File.Exists(filePath))
            {
                var dup = 1;
                var tempName = $"{name}-{dup}{ext}";
                filePath = Path.Combine(targetFolder, tempName);

                while (File.Exists(filePath))
                {
                    dup++;
                    tempName = $"{name}-{dup}{ext}";
                    filePath = Path.Combine(targetFolder, tempName);
                }
            }

            return filePath;
        }

        // customize according to database
        private bool GetStatusMapValue(UploadedFileStatus status)
        {
            return status == UploadedFileStatus.Deleted;
        }
    }
}
