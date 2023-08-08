using Dapper;
using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Web.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data;

namespace DataEditorPortal.Web.Services
{
    public interface IDapperService
    {
        string CurrentUsername { set; }
        string EventSection { get; set; }
        IDbTransaction BeginTransaction(IDbConnection con);
        void Commit(IDbTransaction tran);
        void Rollback(IDbTransaction tran);
        IDataReader ExecuteReader(IDbConnection con, string sql, object param = null, IDbTransaction transaction = null, int? commandTimeout = null, CommandType? commandType = null);
        IEnumerable<dynamic> Query(IDbConnection con, string sql, object param = null, IDbTransaction transaction = null, bool buffered = true, int? commandTimeout = null, CommandType? commandType = null);
        dynamic QueryFirst(IDbConnection con, string sql, object param = null, IDbTransaction transaction = null, int? commandTimeout = null, CommandType? commandType = null);
        object ExecuteScalar(IDbConnection con, string sql, object param = null, IDbTransaction transaction = null, int? commandTimeout = null, CommandType? commandType = null);
        int Execute(IDbConnection con, string sql, object param = null, IDbTransaction transaction = null, int? commandTimeout = null, CommandType? commandType = null);
    }

    public class DapperService : IDapperService
    {
        private IHttpContextAccessor _httpContextAccessor;
        private readonly DepDbContext _depDbContext;
        private readonly ILogger<DapperService> _logger;
        private readonly IEventLogService _eventLogService;

        private string _currentUsername;
        public string CurrentUsername
        {
            set
            {
                _currentUsername = value;
                _eventLogService.CurrentUsername = value;
            }
        }
        public string EventSection { get; set; }

        public DapperService(
            IHttpContextAccessor httpContextAccessor,
            DepDbContext depDbContext,
            ILogger<DapperService> logger, IEventLogService eventLogService)
        {
            _httpContextAccessor = httpContextAccessor;
            _depDbContext = depDbContext;
            _logger = logger;
            _eventLogService = eventLogService;

            if (_httpContextAccessor.HttpContext != null && _httpContextAccessor.HttpContext.User != null)
                CurrentUsername = AppUser.ParseUsername(_httpContextAccessor.HttpContext.User.Identity.Name).Username;
        }

        public IDbTransaction BeginTransaction(IDbConnection con)
        {
            _eventLogService.AddEventLog(EventLogCategory.DATABASE, EventSection, "Begin Transaction", null, null, null, con.ConnectionString);
            return con.BeginTransaction();
        }
        public void Commit(IDbTransaction tran)
        {
            var connectionStr = tran.Connection?.ConnectionString;
            try
            {
                tran.Commit();
                _eventLogService.AddEventLog(EventLogCategory.DATABASE, EventSection, "Commit Transaction", null, null, null, connectionStr);
            }
            catch (Exception ex)
            {
                _eventLogService.AddEventLog(EventLogCategory.ERROR, EventSection, "Commit Transaction Failed", null, null, ex.Message, connectionStr);
                throw;
            }
        }
        public void Rollback(IDbTransaction tran)
        {
            var connectionStr = tran.Connection?.ConnectionString;
            try
            {
                tran.Rollback();
                _eventLogService.AddEventLog(EventLogCategory.DATABASE, EventSection, "Rollback Transaction", null, null, null, connectionStr);
            }
            catch (Exception ex)
            {
                _eventLogService.AddEventLog(EventLogCategory.ERROR, EventSection, "Rollback Transaction Failed", null, null, ex.Message, connectionStr);
                throw;
            }
        }
        public IEnumerable<dynamic> Query(IDbConnection con, string sql, object param = null, IDbTransaction transaction = null, bool buffered = true, int? commandTimeout = null, CommandType? commandType = null)
        {
            try
            {
                var result = con.Query(sql, param, transaction, buffered, commandTimeout, commandType);

                _eventLogService.AddEventLog(EventLogCategory.DATABASE, EventSection, "Query Database", sql, GetParams(param), null, con.ConnectionString);

                return result;
            }
            catch (Exception ex)
            {
                _eventLogService.AddEventLog(EventLogCategory.ERROR, EventSection, "Query Database", sql, GetParams(param), ex.Message, con.ConnectionString);
                //_logger.LogError(ex, ex.Message);

                throw;
            }
        }
        public dynamic QueryFirst(IDbConnection con, string sql, object param = null, IDbTransaction transaction = null, int? commandTimeout = null, CommandType? commandType = null)
        {
            try
            {
                var result = con.QueryFirst(sql, param, transaction, commandTimeout, commandType);

                _eventLogService.AddEventLog(EventLogCategory.DATABASE, EventSection, "Query Database", sql, GetParams(param), null, con.ConnectionString);

                return result;
            }
            catch (Exception ex)
            {
                _eventLogService.AddEventLog(EventLogCategory.ERROR, EventSection, "Query Database", sql, GetParams(param), ex.Message, con.ConnectionString);
                //_logger.LogError(ex, ex.Message);

                throw;
            }
        }
        public IDataReader ExecuteReader(IDbConnection con, string sql, object param = null, IDbTransaction transaction = null, int? commandTimeout = null, CommandType? commandType = null)
        {
            try
            {
                var result = con.ExecuteReader(sql, param, transaction, commandTimeout, commandType);

                _eventLogService.AddEventLog(EventLogCategory.DATABASE, EventSection, "Execute Query", sql, GetParams(param), null, con.ConnectionString);

                return result;
            }
            catch (Exception ex)
            {
                _eventLogService.AddEventLog(EventLogCategory.ERROR, EventSection, "Execute Query", sql, GetParams(param), ex.Message, con.ConnectionString);
                //_logger.LogError(ex, ex.Message);

                throw;
            }
        }
        public object ExecuteScalar(IDbConnection con, string sql, object param = null, IDbTransaction transaction = null, int? commandTimeout = null, CommandType? commandType = null)
        {
            try
            {
                var result = con.ExecuteScalar(sql, param, transaction, commandTimeout, commandType);

                _eventLogService.AddEventLog(EventLogCategory.DATABASE, EventSection, "Execute Query", sql, GetParams(param), null, con.ConnectionString);

                return result;
            }
            catch (Exception ex)
            {
                _eventLogService.AddEventLog(EventLogCategory.ERROR, EventSection, "Execute Query", sql, GetParams(param), ex.Message, con.ConnectionString);
                //_logger.LogError(ex, ex.Message);

                throw;
            }
        }
        public int Execute(IDbConnection con, string sql, object param = null, IDbTransaction transaction = null, int? commandTimeout = null, CommandType? commandType = null)
        {
            try
            {
                var affected = con.Execute(sql, param, transaction, commandTimeout, commandType);

                _eventLogService.AddEventLog(EventLogCategory.DATABASE, EventSection, "Execute Query", sql, GetParams(param), $"{affected} row{(affected == 1 ? "" : "s")} affected.", con.ConnectionString);

                return affected;
            }
            catch (Exception ex)
            {
                _eventLogService.AddEventLog(EventLogCategory.ERROR, EventSection, "Execute Query", sql, GetParams(param), ex.Message, con.ConnectionString);
                //_logger.LogError(ex, ex.Message);

                throw;
            }
        }

        private object GetParams(object param)
        {
            if (param is DynamicParameters dp)
            {
                // param is dynamic parameters, convert it to key value pairs
                Dictionary<string, object> keyValuePairs = new Dictionary<string, object>();
                foreach (var key in dp.ParameterNames)
                {
                    var value = ((SqlMapper.IParameterLookup)dp)[key];
                    keyValuePairs.Add(key, value);
                }
                return keyValuePairs;
            }
            else if (param is List<object> list)
            {
                List<object> keyValuePairList = new List<object>();
                foreach (var item in list)
                {
                    keyValuePairList.Add(GetParams(item));
                }
                return keyValuePairList;
            }
            else
            {
                // param is dynamic object
                return param;
            }
        }
    }
}
