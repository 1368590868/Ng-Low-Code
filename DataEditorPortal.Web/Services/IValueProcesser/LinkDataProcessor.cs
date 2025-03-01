﻿using Dapper;
using DataEditorPortal.Data.Common;
using DataEditorPortal.Web.Models.UniversalGrid;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;

namespace DataEditorPortal.Web.Services
{
    [FilterType("linkDataField")]
    public class LinkDataProcessor : ValueProcessorBase
    {
        private List<RelationDataModel> _inputModel;
        private List<RelationDataModel> _existingModel;
        private RelationInfo _relationInfo;

        private readonly IServiceProvider _serviceProvider;
        private readonly IQueryBuilder _queryBuilder;
        private readonly ILogger<LinkDataProcessor> _logger;
        private readonly IDapperService _dapperService;

        // for delete
        private string _queryToDelete { get; set; }
        private object _parameterToDelete { get; set; }

        public LinkDataProcessor(
            IServiceProvider serviceProvider,
            IQueryBuilder queryBuilder,
            ILogger<LinkDataProcessor> logger,
            IDapperService dapperService)
        {
            _serviceProvider = serviceProvider;
            _queryBuilder = queryBuilder;
            _logger = logger;
            _dapperService = dapperService;
        }

        public override void PreProcess(IDictionary<string, object> model)
        {
            if (_relationInfo == null)
                _relationInfo = _serviceProvider.GetRequiredService<IUniversalGridService>().GetRelationInfo(Config.Name);

            _inputModel = ProcessLinkDataField(model);
            _existingModel = GetLinkDataModelForForm(Config.Name, model);
        }

        public override void PostProcess(IDictionary<string, object> model)
        {
            if (_inputModel != null)
            {
                UpdateLinkData(Config.Name, model);
            }
        }

        public override void FetchValue(IDictionary<string, object> model)
        {
            var data = GetLinkDataModelForForm(Config.Name, model)
                .Select(x => new { table2Id = x.Table2Id })
                .ToList();

            model.Add(Constants.LINK_DATA_FIELD_NAME, data);
        }

        public override void BeforeDeleted(IEnumerable<object> dataIds)
        {
            if (dataIds.Any())
            {
                if (_relationInfo == null)
                    _relationInfo = _serviceProvider.GetRequiredService<IUniversalGridService>().GetRelationInfo(Config.Name);

                // delete secondary table data, donot need to update relation in one to many mode.
                if (_relationInfo.IsOneToMany && !_relationInfo.Table1IsPrimary) return;

                _queryToDelete = _relationInfo.Table1.Query_RemoveRelationById;
                _parameterToDelete = _queryBuilder.GenerateDynamicParameter(
                    new List<KeyValuePair<string, object>>()
                    {
                        new KeyValuePair<string, object>(_relationInfo.Table1.IdColumn, dataIds)
                    }
                );
                _dapperService.Execute(Conn, _queryToDelete, _parameterToDelete, Trans);
            }
        }

        public override void AfterDeleted()
        {
            return;
        }

        private List<RelationDataModel> ProcessLinkDataField(IDictionary<string, object> model)
        {
            List<RelationDataModel> result = null;
            if (model.ContainsKey(Constants.LINK_DATA_FIELD_NAME))
            {
                if (model[Constants.LINK_DATA_FIELD_NAME] != null)
                {
                    var jsonOptions = new JsonSerializerOptions() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
                    JsonElement jsonElement;
                    if (model[Constants.LINK_DATA_FIELD_NAME] is JsonElement) jsonElement = (JsonElement)model[Constants.LINK_DATA_FIELD_NAME];
                    else jsonElement = JsonSerializer.Deserialize<JsonElement>(JsonSerializer.Serialize(model[Constants.LINK_DATA_FIELD_NAME]));

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

        private void UpdateLinkData(string table1Name, IDictionary<string, object> model)
        {
            if (_relationInfo == null)
                _relationInfo = _serviceProvider.GetRequiredService<IUniversalGridService>().GetRelationInfo(table1Name);
            var table1Id = model[_relationInfo.Table1.IdColumn];
            _inputModel.ForEach(m => { m.Table1Id = table1Id; });

            if (!_relationInfo.IsOneToMany || (_relationInfo.IsOneToMany && _relationInfo.Table1IsPrimary))
            {
                // Set table1RefValue, if ReferenceKey Key is not the same as Id Column, query it from database
                _inputModel.ForEach(m => { m.Table1RefValue = table1Id; });
                if (_relationInfo.Table1.IdColumn != _relationInfo.Table1.ReferenceKey)
                {
                    var table1Ids = new List<object>() { table1Id };
                    var queryText = _queryBuilder.GenerateSqlTextForQueryForeignKeyValue(_relationInfo.Table1);
                    var param = _queryBuilder.GenerateDynamicParameter(
                        new List<KeyValuePair<string, object>>() { new KeyValuePair<string, object>(_relationInfo.Table1.IdColumn, table1Ids) }
                    );
                    // get the table1RefValue
                    var datas = _dapperService.Query(Conn, queryText, param, Trans)
                        .Cast<IDictionary<string, object>>()
                        .Select(d => new
                        {
                            TableId = d[_relationInfo.Table1.IdColumn],
                            TableRefValue = d[_relationInfo.Table1.ReferenceKey]
                        });

                    _inputModel.ForEach(m =>
                    {
                        m.Table1RefValue = datas
                            .Where(d => d.TableId != null && d.TableId.ToString() == m.Table1Id.ToString())
                            .Select(d => d.TableRefValue)
                            .FirstOrDefault();
                    });
                }
            }

            if (!_relationInfo.IsOneToMany || (_relationInfo.IsOneToMany && !_relationInfo.Table1IsPrimary))
            {
                // Set table2RefValue, if ReferenceKey Key is not the same as Id Column, query it from database
                _inputModel.ForEach(m => m.Table2RefValue = m.Table2Id);
                if (_relationInfo.Table2.IdColumn != _relationInfo.Table2.ReferenceKey)
                {
                    var table2Ids = _inputModel.Select(m => m.Table2Id);
                    var queryText = _queryBuilder.GenerateSqlTextForQueryForeignKeyValue(_relationInfo.Table2);
                    var param = _queryBuilder.GenerateDynamicParameter(
                        new List<KeyValuePair<string, object>>() { new KeyValuePair<string, object>(_relationInfo.Table2.IdColumn, table2Ids) }
                    );

                    var datas = _dapperService.Query(Conn, queryText, param, Trans)
                        .Cast<IDictionary<string, object>>()
                        .Select(d => new
                        {
                            TableId = d[_relationInfo.Table2.IdColumn],
                            TableRefValue = d[_relationInfo.Table2.ReferenceKey]
                        });

                    _inputModel.ForEach(m =>
                    {
                        m.Table2RefValue = datas
                            .Where(d => d.TableId != null && d.TableId.ToString() == m.Table2Id.ToString())
                            .Select(d => d.TableRefValue)
                            .FirstOrDefault();
                    });
                }
            }

            try
            {
                var toAdd = _inputModel.Where(
                    input => _existingModel.All(
                        existing => !(
                            existing.Table1Id.ToString() == input.Table1Id.ToString() &&
                            existing.Table2Id.ToString() == input.Table2Id.ToString()
                        )
                    )
                );
                if (toAdd.Any())
                {
                    var sql = _relationInfo.Query_AddRelation;

                    foreach (var item in toAdd)
                    {
                        var value = new List<KeyValuePair<string, object>>();
                        if (_relationInfo.IsOneToMany)
                        {
                            if (_relationInfo.Table1IsPrimary)
                            {
                                value.Add(new KeyValuePair<string, object>(_relationInfo.Table1.ForeignKey, item.Table1RefValue));
                                value.Add(new KeyValuePair<string, object>(_relationInfo.Table2.IdColumn, item.Table2Id));
                            }
                            else
                            {
                                value.Add(new KeyValuePair<string, object>(_relationInfo.Table2.ForeignKey, item.Table2RefValue));
                                value.Add(new KeyValuePair<string, object>(_relationInfo.Table1.IdColumn, item.Table1Id));
                            }
                        }
                        else
                        {
                            value.Add(new KeyValuePair<string, object>(_relationInfo.Table1.ForeignKey, item.Table1RefValue));
                            value.Add(new KeyValuePair<string, object>(_relationInfo.Table2.ForeignKey, item.Table2RefValue));
                        }
                        var dynamicParameters = new DynamicParameters(_queryBuilder.GenerateDynamicParameter(value));

                        _dapperService.Execute(Conn, sql, dynamicParameters, Trans);
                    }
                }

                // when editing relation on secondary table in one to many mode, we don't need to process toDelete.
                if (_relationInfo.IsOneToMany && !_relationInfo.Table1IsPrimary) return;

                var toDelete = _existingModel.Where(
                    existing => _inputModel.All(
                        input => !(
                            input.Table1Id.ToString() == existing.Table1Id.ToString() &&
                            input.Table2Id.ToString() == existing.Table2Id.ToString()
                        )
                    )
                );

                if (toDelete.Any())
                {
                    var sql = _relationInfo.Query_RemoveRelation;

                    foreach (var item in toDelete)
                    {
                        var value = new List<KeyValuePair<string, object>>();
                        if (_relationInfo.IsOneToMany)
                        {
                            if (_relationInfo.Table1IsPrimary)
                            {
                                value.Add(new KeyValuePair<string, object>(_relationInfo.Table1.ForeignKey, null));
                                value.Add(new KeyValuePair<string, object>(_relationInfo.Table2.IdColumn, item.Table2Id));
                            }
                            else
                            {
                                value.Add(new KeyValuePair<string, object>(_relationInfo.Table2.ForeignKey, null));
                                value.Add(new KeyValuePair<string, object>(_relationInfo.Table1.IdColumn, item.Table1Id));
                            }
                        }
                        else
                        {
                            value.Add(new KeyValuePair<string, object>(_relationInfo.Table1.ForeignKey, item.Table1RefValue));
                            value.Add(new KeyValuePair<string, object>(_relationInfo.Table2.ForeignKey, item.Table2RefValue));
                        }
                        var dynamicParameters = new DynamicParameters(_queryBuilder.GenerateDynamicParameter(value));

                        _dapperService.Execute(Conn, sql, dynamicParameters, Trans);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                throw;
            }
        }

        private List<RelationDataModel> GetLinkDataModelForForm(string table1Name, IDictionary<string, object> model)
        {
            if (_relationInfo == null)
                _relationInfo = _serviceProvider.GetRequiredService<IUniversalGridService>().GetRelationInfo(table1Name);

            object table1Id = null;
            if (model.Keys.Contains(_relationInfo.Table1.IdColumn))
                table1Id = model[_relationInfo.Table1.IdColumn];

            List<RelationDataModel> relationData = new List<RelationDataModel>();
            if (table1Id != null)
            {
                var queryText = _relationInfo.Table1.Query_GetRelationDataById;
                var param = _queryBuilder.GenerateDynamicParameter(new Dictionary<string, object>() { { _relationInfo.Table1.IdColumn, table1Id } });

                var table2Ids = Enumerable.Empty<object>();
                try
                {
                    var datas = _dapperService.Query(Conn, queryText, param, Trans);

                    DataTable schema;
                    using (var dr = Conn.ExecuteReader(queryText, param, Trans))
                    {
                        schema = dr.GetSchemaTable();
                    }

                    relationData = datas.Select(data =>
                    {
                        var item = (IDictionary<string, object>)data;

                        foreach (var key in item.Keys)
                        {
                            var index = item.Keys.ToList().IndexOf(key);
                            item[key] = _queryBuilder.TransformValue(item[key], schema.Rows[index]);
                        }

                        return new RelationDataModel()
                        {
                            Table1Id = item[$"T1_{_relationInfo.Table1.IdColumn}"],
                            Table2Id = item[$"T2_{_relationInfo.Table2.IdColumn}"],
                            Table1RefValue = item[$"F1_{_relationInfo.Table1.ForeignKey}"],
                            Table2RefValue = item[$"F2_{_relationInfo.Table2.ForeignKey}"]
                        };
                    }).ToList();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, ex.Message);
                    throw;
                }
            }

            return relationData;
        }
    }

    [FilterType("linkDataField")]
    public class LinkDataComparer : ValueComparerBase
    {
        public override bool Equals(object v1, object v2)
        {
            if (ReferenceEquals(v1, v2))
                return true;

            if (v1 == null || v2 == null)
                return false;

            //value of link data should be IEnumerable<IDictionary<string, object>>, otherwise throw exception
            var x = ((IEnumerable<object>)v1).Cast<IDictionary<string, object>>();
            var y = ((IEnumerable<object>)v2).Cast<IDictionary<string, object>>();

            if (x.Count() != y.Count()) return false;

            var jsonOptions = new JsonSerializerOptions() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase, DictionaryKeyPolicy = JsonNamingPolicy.CamelCase };
            return JsonSerializer.Serialize(x, jsonOptions) == JsonSerializer.Serialize(y, jsonOptions);
        }

        public override int GetHashCode(object val)
        {
            if (val == null)
                return 0;

            var obj = (IEnumerable<object>)val;

            int hashCode = 17;
            foreach (var v in obj)
            {
                hashCode = hashCode * 23 + v.GetHashCode();
            }

            return hashCode;
        }

        public override string GetValueString(object val)
        {
            return val == null ? "" : JsonSerializer.Serialize(val);
        }
    }
}
