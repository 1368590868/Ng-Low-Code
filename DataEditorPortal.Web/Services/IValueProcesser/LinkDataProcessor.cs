using Dapper;
using DataEditorPortal.Data.Common;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Models.UniversalGrid;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Linq;
using System.Text.Json;

namespace DataEditorPortal.Web.Services
{
    [FilterType("linkDataField")]
    public class LinkDataProcessor : ValueProcessorBase
    {
        private UniversalGridConfiguration _config;
        private List<RelationDataModel> _relationDataModels;
        private LinkedTableInfo _linkedTableInfo;

        private readonly IServiceProvider _serviceProvider;
        private readonly IQueryBuilder _queryBuilder;
        private readonly ILogger<LinkDataProcessor> _logger;

        // for delete
        private string _queryToDelete { get; set; }
        private object _parameterToDelete { get; set; }

        public LinkDataProcessor(
            IServiceProvider serviceProvider,
            IQueryBuilder queryBuilder,
            ILogger<LinkDataProcessor> logger)
        {
            _serviceProvider = serviceProvider;
            _queryBuilder = queryBuilder;
            _logger = logger;
        }

        public override void PreProcess(UniversalGridConfiguration config, FormFieldConfig field, IDictionary<string, object> model)
        {
            _config = config;
            _relationDataModels = ProcessLinkDataField(model);
        }

        public override void PostProcess(object dataId)
        {
            if (_relationDataModels != null)
            {
                UpdateLinkData(_config.Name, dataId, _relationDataModels);
            }
        }

        public override void FetchValue(UniversalGridConfiguration config, FormFieldConfig field, object dataId, IDictionary<string, object> model)
        {
            _config = config;
            model.Add(Constants.LINK_DATA_FIELD_NAME, GetLinkDataModelForForm(_config.Name, dataId));
        }


        public override void BeforeDeleted(UniversalGridConfiguration config, FormFieldConfig field, IEnumerable<object> dataIds)
        {
            _config = config;

            if (dataIds.Any())
            {
                if (_linkedTableInfo == null)
                    _linkedTableInfo = _serviceProvider.GetRequiredService<IUniversalGridService>().GetLinkedTableInfo(config.Name);

                _queryToDelete = _queryBuilder.GenerateSqlTextForDeleteLinkData(_linkedTableInfo.LinkTable, _linkedTableInfo.Table1);
                _parameterToDelete = _queryBuilder.GenerateDynamicParameter(
                    new List<KeyValuePair<string, object>>()
                    {
                    new KeyValuePair<string, object>(_linkedTableInfo.Table1.ForeignKey, dataIds)
                    }
                );
            }
        }

        public override void AfterDeleted()
        {
            if (string.IsNullOrEmpty(_queryToDelete) && _parameterToDelete != null)
            {
                try
                {
                    using (var con = _serviceProvider.GetRequiredService<DbConnection>())
                    {
                        con.ConnectionString = _linkedTableInfo.LinkTable.ConnectionString;
                        con.Open();
                        con.Execute(_queryToDelete, _parameterToDelete);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.Message, ex);
                }
            }
        }

        private List<RelationDataModel> ProcessLinkDataField(IDictionary<string, object> model)
        {
            List<RelationDataModel> result = null;
            if (model.ContainsKey(Constants.LINK_DATA_FIELD_NAME))
            {
                if (model[Constants.LINK_DATA_FIELD_NAME] != null)
                {
                    var jsonOptions = new JsonSerializerOptions() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
                    var jsonElement = (JsonElement)model[Constants.LINK_DATA_FIELD_NAME];
                    if (jsonElement.ValueKind == JsonValueKind.Array || jsonElement.ValueKind == JsonValueKind.String)
                    {
                        var valueStr = jsonElement.ToString();
                        result = JsonSerializer.Deserialize<List<RelationDataModel>>(valueStr, jsonOptions);
                    }
                }
                model.Remove(Constants.LINK_DATA_FIELD_NAME);
            }
            return result;
        }

        private void UpdateLinkData(string table1Name, object table1Id, List<RelationDataModel> inputModel)
        {
            var existingModel = GetLinkDataModelForForm(table1Name, table1Id);

            if (_linkedTableInfo == null)
                _linkedTableInfo = _serviceProvider.GetRequiredService<IUniversalGridService>().GetLinkedTableInfo(table1Name);
            var linkTable = _linkedTableInfo.LinkTable;

            using (var con = _serviceProvider.GetRequiredService<DbConnection>())
            {
                con.ConnectionString = linkTable.ConnectionString;
                //var trans = con.BeginTransaction();

                try
                {
                    var toAdd = inputModel
                        .Where(input => existingModel.All(existing => !(existing.Table1Id == input.Table1Id && existing.Table2Id == input.Table2Id)))
                        .Select(x => x.Table2Id);
                    if (toAdd.Any())
                    {
                        var sql = _linkedTableInfo.LinkTable.Query_Insert;

                        foreach (var table2Id in toAdd)
                        {
                            var value = new List<KeyValuePair<string, object>>();
                            value.Add(new KeyValuePair<string, object>(_linkedTableInfo.Table1.ForeignKey, table1Id));
                            value.Add(new KeyValuePair<string, object>(_linkedTableInfo.Table2.ForeignKey, table2Id));
                            var dynamicParameters = new DynamicParameters(_queryBuilder.GenerateDynamicParameter(value));
                            var paramReturnId = _queryBuilder.ParameterName($"RETURNED_{linkTable.IdColumn}");
                            dynamicParameters.Add(paramReturnId, dbType: DbType.String, direction: ParameterDirection.Output, size: 40);

                            con.Execute(sql, dynamicParameters);
                        }
                    }

                    var toDelete = existingModel
                        .Where(existing => inputModel.All(input => !(input.Table1Id == existing.Table1Id && input.Table2Id == existing.Table2Id)))
                        .Select(x => x.Id);
                    if (toDelete.Any())
                    {
                        var deleteSql = _linkedTableInfo.LinkTable.Query_Delete;
                        var deleteParam = _queryBuilder.GenerateDynamicParameter(
                            new List<KeyValuePair<string, object>>() { new KeyValuePair<string, object>(linkTable.IdColumn, toDelete) }
                        );
                        con.Execute(deleteSql, deleteParam);
                    }
                    //trans.Commit();
                }
                catch (Exception ex)
                {
                    //trans.Rollback();
                    _logger.LogError(ex.Message, ex);
                    throw;
                }
            }
        }

        private List<RelationDataModel> GetLinkDataModelForForm(string table1Name, object table1Id)
        {
            if (_linkedTableInfo == null)
                _linkedTableInfo = _serviceProvider.GetRequiredService<IUniversalGridService>().GetLinkedTableInfo(table1Name);

            List<RelationDataModel> relationData = new List<RelationDataModel>();
            if (table1Id != null)
            {
                var queryText = _linkedTableInfo.Table1.Query_GetLinkedDataById;
                var param = _queryBuilder.GenerateDynamicParameter(new Dictionary<string, object>() { { _linkedTableInfo.Table1.IdColumn, table1Id } });

                var table2Ids = Enumerable.Empty<object>();
                try
                {
                    using (var con = _serviceProvider.GetRequiredService<DbConnection>())
                    {
                        con.ConnectionString = _linkedTableInfo.LinkTable.ConnectionString;
                        con.Open();
                        var datas = con.Query(queryText, param);

                        relationData = datas.Select(data =>
                        {
                            var item = (IDictionary<string, object>)data;

                            return new RelationDataModel()
                            {
                                Id = item[$"LINK_{_linkedTableInfo.LinkTable.IdColumn}"],
                                Table1Id = item[$"T1_{_linkedTableInfo.Table1.IdColumn}"],
                                Table2Id = item[$"T2_{_linkedTableInfo.Table2.IdColumn}"]
                            };
                        }).ToList();
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.Message, ex);
                }
            }

            return relationData;
        }
    }
}
