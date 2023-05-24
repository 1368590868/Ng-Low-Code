using Dapper;
using DataEditorPortal.Data.Common;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Models.UniversalGrid;
using Microsoft.EntityFrameworkCore;
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

        private readonly IServiceProvider _serviceProvider;
        private readonly IQueryBuilder _queryBuilder;
        private readonly ILogger<LinkDataProcessor> _logger;

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

        private List<RelationDataModel> ProcessLinkDataField(IDictionary<string, object> model)
        {
            List<RelationDataModel> result = null;
            if (model.ContainsKey(Constants.LINK_DATA_FIELD_NAME) && model[Constants.LINK_DATA_FIELD_NAME] != null)
            {
                var jsonOptions = new JsonSerializerOptions() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
                var jsonElement = (JsonElement)model[Constants.LINK_DATA_FIELD_NAME];
                if (jsonElement.ValueKind == JsonValueKind.Array || jsonElement.ValueKind == JsonValueKind.String)
                {
                    var valueStr = jsonElement.ToString();
                    result = JsonSerializer.Deserialize<List<RelationDataModel>>(valueStr, jsonOptions);
                    model.Remove(Constants.LINK_DATA_FIELD_NAME);
                }
            }
            return result;
        }

        private void UpdateLinkData(string table1Name, object table1Id, List<RelationDataModel> inputModel)
        {
            var service = _serviceProvider.GetRequiredService<IUniversalGridService>();

            var existingModel = GetLinkDataModelForForm(table1Name, table1Id);

            var linkedTableInfo = service.GetLinkedTableInfo(table1Name);

            using (var con = _serviceProvider.GetRequiredService<DbConnection>())
            {
                con.ConnectionString = linkedTableInfo.ConnectionString;
                //var trans = con.BeginTransaction();

                try
                {
                    var toAdd = inputModel
                        .Where(input => existingModel.All(existing => !(existing.Table1Id == input.Table1Id && existing.Table2Id == input.Table2Id)))
                        .Select(x => x.Table2Id);
                    if (toAdd.Any())
                    {
                        var queryToGetId = linkedTableInfo.LinkedTable.QueryToGetId;
                        var columns = new List<string>() { linkedTableInfo.Table1MappingField, linkedTableInfo.Table2MappingField };
                        if (queryToGetId != null && !string.IsNullOrEmpty(queryToGetId.queryText))
                        {
                            columns.Add(linkedTableInfo.LinkedTable.IdColumn);
                        }
                        linkedTableInfo.LinkedTable.Columns = columns;
                        var sql = _queryBuilder.GenerateSqlTextForInsert(linkedTableInfo.LinkedTable);

                        foreach (var table2Id in toAdd)
                        {
                            var value = new List<KeyValuePair<string, object>>();
                            // if queryToGetId configured, get id first.
                            if (queryToGetId != null && !string.IsNullOrEmpty(queryToGetId.queryText))
                            {
                                var idValue = con.ExecuteScalar(queryToGetId.queryText, null, null, null, queryToGetId.type);
                                value.Add(new KeyValuePair<string, object>(linkedTableInfo.LinkedTable.IdColumn, idValue));
                            }
                            value.Add(new KeyValuePair<string, object>(linkedTableInfo.Table1MappingField, table1Id));
                            value.Add(new KeyValuePair<string, object>(linkedTableInfo.Table2MappingField, table2Id));
                            var dynamicParameters = new DynamicParameters(_queryBuilder.GenerateDynamicParameter(value));
                            var paramReturnId = _queryBuilder.ParameterName($"RETURNED_{linkedTableInfo.LinkedTable.IdColumn}");
                            dynamicParameters.Add(paramReturnId, dbType: DbType.String, direction: ParameterDirection.Output, size: 40);

                            con.Execute(sql, dynamicParameters);
                        }
                    }

                    var toDelete = existingModel
                        .Where(existing => inputModel.All(input => !(input.Table1Id == existing.Table1Id && input.Table2Id == existing.Table2Id)))
                        .Select(x => x.Id);
                    if (toDelete.Any())
                    {
                        var deleteSql = _queryBuilder.GenerateSqlTextForDelete(linkedTableInfo.LinkedTable);
                        var deleteParam = _queryBuilder.GenerateDynamicParameter(
                            new List<KeyValuePair<string, object>>() {
                        new KeyValuePair<string, object>(linkedTableInfo.LinkedTable.IdColumn, toDelete)
                            });
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
            var service = _serviceProvider.GetRequiredService<IUniversalGridService>();
            var linkedTableInfo = service.GetLinkedTableInfo(table1Name);

            List<RelationDataModel> relationData = new List<RelationDataModel>();
            if (table1Id != null)
            {
                var filters = new List<FilterParam>() {
                    new FilterParam() {
                        field = linkedTableInfo.Table1MappingField,
                        value = table1Id,
                        matchMode = "equals"
                    }
                };

                var linkedData = service.GetGridData(linkedTableInfo.Name, new GridParam() { IndexCount = -1, Filters = filters });
                relationData = linkedData.Data.Select(x => new RelationDataModel()
                {
                    Id = x[linkedTableInfo.LinkedTable.IdColumn],
                    Table1Id = table1Id,
                    Table2Id = x[linkedTableInfo.Table2MappingField]
                }).ToList();
            }

            return relationData;
        }
    }
}
