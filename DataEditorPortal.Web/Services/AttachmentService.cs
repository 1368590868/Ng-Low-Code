using Dapper;
using DataEditorPortal.Data.Common;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Models;
using DataEditorPortal.Web.Models.UniversalGrid;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.IO;
using System.Linq;

namespace DataEditorPortal.Web.Services
{
    public interface IAttachmentService
    {
        FileUploadConfig GetDefaultConfig();
        void SaveUploadedFiles(UploadedFileMeta uploadedFileMeta, object dataId, string gridName);
        dynamic GetFileStream(string fileId, FileUploadConfig options);
    }

    public class AttachmentService : IAttachmentService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly IHostEnvironment _hostEnvironment;
        private readonly IQueryBuilder _queryBuilder;
        private readonly DepDbContext _depDbContext;

        private FileUploadConfig DEFAULT_CONFIG = new FileUploadConfig()
        {
            DataSourceConnectionId = Constants.DEFAULT_CONNECTION_ID,
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
                { "DATA_ID", "DATA_ID" }
            }
        };

        public AttachmentService(
            IHostEnvironment hostEnvironment,
            IServiceProvider serviceProvider,
            IQueryBuilder queryBuilder,
            DepDbContext depDbContext)
        {
            _hostEnvironment = hostEnvironment;
            _serviceProvider = serviceProvider;
            _queryBuilder = queryBuilder;
            _depDbContext = depDbContext;
        }

        public FileUploadConfig GetDefaultConfig()
        {
            return DEFAULT_CONFIG;
        }
        public void SaveUploadedFiles(UploadedFileMeta uploadedFileMeta, object dataId, string gridName)
        {
            var config = GetConfigOrDefault(uploadedFileMeta);
            var storageType = config.FileStorageType;

            var insertScript = GetInsertScript(config);
            var updateScript = GetUpdateScript(config);

            List<object> insertParameters = new List<object>();
            List<object> updateParameters = new List<object>();
            var tempFiles = new List<string>();
            foreach (var uploadedFile in uploadedFileMeta.UploadedFiles)
            {
                if (uploadedFile.Status == Data.Common.UploadedFileStatus.New)
                {
                    string tempFolder = Path.Combine(_hostEnvironment.ContentRootPath, "wwwroot/FileUploadTemp");
                    var tempFilePath = Path.Combine(tempFolder, $"{uploadedFile.FileId} - {uploadedFile.FileName}");
                    tempFiles.Add(tempFilePath);

                    var value = new List<KeyValuePair<string, object>>();
                    if (storageType == FileStorageType.FileSystem)
                    {
                        string targetFolder = Path.Combine(_hostEnvironment.ContentRootPath, $"wwwroot\\Attachements\\{gridName}");
                        if (!Directory.Exists(targetFolder)) Directory.CreateDirectory(targetFolder);
                        var destFilePath = Path.Combine(targetFolder, $"{uploadedFile.FileId} - {uploadedFile.FileName}");

                        File.Copy(tempFilePath, destFilePath, true);

                        value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("FILE_PATH"), destFilePath));
                    }
                    else if (storageType == FileStorageType.SqlBinary)
                    {
                        value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("FILE_BYTES"), File.ReadAllBytes(tempFilePath)));
                    }

                    value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("ID"), uploadedFile.FileId));
                    value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("CONTENT_TYPE"), uploadedFile.ContentType));
                    value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("STATUS"), UploadedFileStatus.Current.ToString()));
                    value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("FILE_NAME"), uploadedFile.FileName));
                    value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("COMMENTS"), uploadedFile.Comments));
                    value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("DATA_ID"), dataId));
                    insertParameters.Add(_queryBuilder.GenerateDynamicParameter(value));
                }
                else
                {
                    var value = new List<KeyValuePair<string, object>>();
                    value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("ID"), uploadedFile.FileId));
                    value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("STATUS"), uploadedFile.Status.ToString()));
                    value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("COMMENTS"), uploadedFile.Comments));
                    updateParameters.Add(_queryBuilder.GenerateDynamicParameter(value));
                }
            }

            var dsConnection = _depDbContext.DataSourceConnections.FirstOrDefault(x => x.Id == config.DataSourceConnectionId);
            using (var con = _serviceProvider.GetRequiredService<DbConnection>())
            {
                con.ConnectionString = dsConnection.ConnectionString;
                if (insertParameters.Any())
                    con.Execute(insertScript, insertParameters);
                if (updateParameters.Any())
                    con.Execute(updateScript, updateParameters);
            }

            tempFiles.ForEach(x => File.Delete(x));
        }

        public dynamic GetFileStream(string fileId, FileUploadConfig config)
        {
            if (config == null) config = DEFAULT_CONFIG;
            var strogeType = config.FileStorageType;

            var fileByteColumn = config.GetMappedColumn("FILE_BYTES");
            var filePathColumn = config.GetMappedColumn("FILE_PATH");
            var fileNameColumn = config.GetMappedColumn("FILE_NAME");
            var contentTypeColumn = config.GetMappedColumn("CONTENT_TYPE");

            var idColumn = config.GetMappedColumn("ID");
            var queryScript = _queryBuilder.GenerateSqlTextForInsert(new DataSourceConfig()
            {
                QueryText = $"SELECT {fileNameColumn},{contentTypeColumn},{(strogeType == FileStorageType.FileSystem ? filePathColumn : fileByteColumn)} FROM {config.TableSchema}.{config.TableName} WHERE {idColumn}=##{idColumn}##"
            });
            var value = new List<KeyValuePair<string, object>>();
            value.Add(new KeyValuePair<string, object>(idColumn, fileId));
            var param = _queryBuilder.GenerateDynamicParameter(value);

            string fileName = null;
            string contentType = null;
            Stream stream = null;

            using (var con = _serviceProvider.GetRequiredService<DbConnection>())
            {
                var uploadedFile = con.QueryFirst(queryScript, param);
                if (uploadedFile == null) throw new DepException($"File [{fileId}] doesn't exist.");

                if (strogeType == FileStorageType.FileSystem)
                {
                    stream = File.OpenRead((string)(uploadedFile as IDictionary<string, object>)[filePathColumn]);
                }
                else
                {
                    byte[] fileBytes = (byte[])(uploadedFile as IDictionary<string, object>)[fileByteColumn];
                    new MemoryStream(fileBytes);
                    stream.Position = 0;
                }
                fileName = (string)(uploadedFile as IDictionary<string, object>)[fileName];
                contentType = (string)(uploadedFile as IDictionary<string, object>)[contentType];
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

            var fieldMapping = config.FieldMapping.Where(x => x.Key != (storageType == FileStorageType.FileSystem ? "FILE_BYTES" : "FILE_PATH")).Select(x => x.Value);
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

            var columns = config.FieldMapping.Where(x => x.Key == "COMMENTS" || x.Key == "STATUS").Select(x => x.Value);
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
    }
}
