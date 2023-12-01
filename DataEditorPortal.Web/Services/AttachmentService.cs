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
using System.IO;
using System.Linq;

namespace DataEditorPortal.Web.Services
{
    public interface IAttachmentService
    {
        FileUploadConfig GetDefaultConfig();
        void SaveUploadedFiles(UploadedFileMeta uploadedFileMeta, IDictionary<string, object> model, IDbConnection con, IDbTransaction trans);
        void RemoveFiles(FileUploadConfig config, IEnumerable<object> ids, IDbConnection con, IDbTransaction trans);
        dynamic GetFileStream(string fileId, FileUploadConfig options);
    }

    public class AttachmentService : IAttachmentService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly IHostEnvironment _hostEnvironment;
        private readonly IQueryBuilder _queryBuilder;
        private readonly DepDbContext _depDbContext;
        private readonly IDapperService _dapperService;
        private readonly ICurrentUserAccessor _currentUserAccessor;

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

        private string _currentUsername;

        public AttachmentService(
            IHostEnvironment hostEnvironment,
            IServiceProvider serviceProvider,
            IQueryBuilder queryBuilder,
            DepDbContext depDbContext,
            IDapperService dapperService,
            ICurrentUserAccessor currentUserAccessor)
        {
            _hostEnvironment = hostEnvironment;
            _serviceProvider = serviceProvider;
            _queryBuilder = queryBuilder;
            _depDbContext = depDbContext;
            _dapperService = dapperService;

            _currentUserAccessor = currentUserAccessor;
            _currentUsername = _currentUserAccessor.CurrentUser.Username();
        }

        public FileUploadConfig GetDefaultConfig()
        {
            return DEFAULT_CONFIG;
        }

        public void SaveUploadedFiles(UploadedFileMeta uploadedFileMeta, IDictionary<string, object> model, IDbConnection con, IDbTransaction trans)
        {
            var config = GetConfigOrDefault(uploadedFileMeta);
            var storageType = config.FileStorageType;

            var targetFolder = string.Empty;
            if (storageType == FileStorageType.FileSystem)
            {
                targetFolder = EnsureTargetFolder(config, uploadedFileMeta.GridName);
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
                        value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("CREATED_BY"), _currentUsername));

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

                    var param = _queryBuilder.GenerateDynamicParameter(value);
                    var dynamicParameters = new DynamicParameters(param);
                    var paramReturnId = _queryBuilder.ParameterName($"RETURNED_{config.GetMappedColumn("ID")}");
                    dynamicParameters.Add(paramReturnId, dbType: null, direction: ParameterDirection.Output, size: 40);

                    insertParameters.Add(dynamicParameters);
                }
                else
                {
                    var value = new List<KeyValuePair<string, object>>();
                    value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("ID"), uploadedFile.FileId));
                    value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("STATUS"), GetStatusMapValue(uploadedFile.Status)));
                    if (!string.IsNullOrEmpty(config.GetMappedColumn("MODIFIED_DATE")))
                        value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("MODIFIED_DATE"), DateTime.UtcNow));
                    if (!string.IsNullOrEmpty(config.GetMappedColumn("MODIFIED_BY")))
                        value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("MODIFIED_BY"), _currentUsername));

                    if (!string.IsNullOrEmpty(config.GetMappedColumn("COMMENTS")))
                        value.Add(new KeyValuePair<string, object>(config.GetMappedColumn("COMMENTS"), uploadedFile.Comments));

                    updateParameters.Add(_queryBuilder.GenerateDynamicParameter(value));
                }
            }


            if (insertParameters.Any())
            {
                _dapperService.Execute(con, insertScript, insertParameters, trans);
            }
            if (updateParameters.Any())
                _dapperService.Execute(con, updateScript, updateParameters, trans);

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
            _dapperService.EventSection = $"GetFileStream";

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

            var queryScript = _queryBuilder.GenerateSqlTextForDetail(new DataSourceConfig()
            {
                TableName = config.TableName,
                TableSchema = config.TableSchema,
                Columns = fields.ToList(),
                IdColumn = config.GetMappedColumn("ID")
            });
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
                var uploadedFile = _dapperService.QueryFirst(con, queryScript, param);
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
                    stream = new MemoryStream(fileBytes);
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

            return _queryBuilder.GenerateSqlTextForInsert(new DataSourceConfig()
            {
                TableName = config.TableName,
                TableSchema = config.TableSchema,
                Columns = fieldMapping.ToList(),
                IdColumn = config.GetMappedColumn("ID")
            });
        }

        private string GetUpdateScript(FileUploadConfig config)
        {
            if (config == null) config = DEFAULT_CONFIG;

            var columns = config.FieldMapping
                .Where(x => x.Key == "COMMENTS" || x.Key == "STATUS" || x.Key == "MODIFIED_DATE" || x.Key == "MODIFIED_BY")
                .Where(x => !string.IsNullOrEmpty(x.Value))
                .Select(x => x.Value);

            return _queryBuilder.GenerateSqlTextForUpdate(new DataSourceConfig()
            {
                TableName = config.TableName,
                TableSchema = config.TableSchema,
                Columns = columns.ToList(),
                IdColumn = config.GetMappedColumn("ID")
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
        private string GetStatusMapValue(UploadedFileStatus status)
        {
            return status == UploadedFileStatus.Deleted ? "N" : "Y";
        }

        public void RemoveFiles(FileUploadConfig config, IEnumerable<object> ids, IDbConnection con, IDbTransaction trans)
        {
            if (config == null) config = DEFAULT_CONFIG;

            if (ids.Any())
            {
                var foreignKeyColumn = config.GetMappedColumn("FOREIGN_KEY");
                var param = _queryBuilder.GenerateDynamicParameter(
                    new List<KeyValuePair<string, object>>() { new KeyValuePair<string, object>(foreignKeyColumn, ids) }
                );

                // remove phsical file if FileStorageType is FileSYstem
                IEnumerable<string> files = Enumerable.Empty<string>();
                if (config.FileStorageType == FileStorageType.FileSystem)
                {
                    var filePathColumn = config.GetMappedColumn("FILE_PATH");
                    var fileNameColumn = config.GetMappedColumn("FILE_NAME");

                    // check strogeType
                    List<string> fields = new List<string>() { fileNameColumn };
                    if (!string.IsNullOrEmpty(filePathColumn)) fields.Add(filePathColumn);

                    var queryText = _queryBuilder.GenerateSqlTextForDetail(new DataSourceConfig()
                    {
                        TableName = config.TableName,
                        TableSchema = config.TableSchema,
                        Columns = fields.ToList(),
                        IdColumn = foreignKeyColumn
                    }, true);

                    files = _dapperService.Query(con, queryText, param, trans)
                        .Cast<IDictionary<string, object>>()
                        .Select(file =>
                        {
                            string filePath = null;
                            if (!string.IsNullOrEmpty(filePathColumn))
                                filePath = (string)file[filePathColumn];
                            else
                                filePath = Path.Combine(config.BasePath, (string)file[fileNameColumn]);
                            return filePath;
                        });
                }

                var queryToDelete = _queryBuilder.GenerateSqlTextForDelete(new DataSourceConfig()
                {
                    TableName = config.TableName,
                    TableSchema = config.TableSchema,
                    IdColumn = foreignKeyColumn
                });
                var parameterToDelete = _queryBuilder.GenerateDynamicParameter(
                    new List<KeyValuePair<string, object>>()
                    {
                        new KeyValuePair<string, object>(config.GetMappedColumn("FOREIGN_KEY"), ids)
                    }
                );
                _dapperService.Execute(con, queryToDelete, parameterToDelete, trans);

                try
                {
                    foreach (var file in files)
                        if (File.Exists(file)) File.Delete(file);
                }
                catch { }
            }
        }
    }
}
