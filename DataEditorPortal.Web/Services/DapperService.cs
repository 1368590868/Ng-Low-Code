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
            _eventLogService.AddEventLog(EventLogCategory.DATABASE, EventSection, "Begin Transaction", null);
            return con.BeginTransaction();
        }
        public void Commit(IDbTransaction tran)
        {
            try
            {
                tran.Commit();
                _eventLogService.AddEventLog(EventLogCategory.DATABASE, EventSection, "Commit Transaction", null);
            }
            catch (Exception ex)
            {
                _eventLogService.AddEventLog(EventLogCategory.ERROR, EventSection, "Commit Transaction Failed", ex.Message);
                throw;
            }
        }
        public void Rollback(IDbTransaction tran)
        {
            try
            {
                tran.Rollback();
                _eventLogService.AddEventLog(EventLogCategory.DATABASE, EventSection, "Rollback Transaction", null);
            }
            catch (Exception ex)
            {
                _eventLogService.AddEventLog(EventLogCategory.ERROR, EventSection, "Rollback Transaction Failed", ex.Message);
                throw;
            }
        }
        public IEnumerable<dynamic> Query(IDbConnection con, string sql, object param = null, IDbTransaction transaction = null, bool buffered = true, int? commandTimeout = null, CommandType? commandType = null)
        {
            try
            {
                var result = con.Query(sql, param, transaction, buffered, commandTimeout, commandType);

                _eventLogService.AddEventLog(EventLogCategory.DATABASE, EventSection, "Query Database", sql, param);

                return result;
            }
            catch (Exception ex)
            {
                _eventLogService.AddEventLog(EventLogCategory.ERROR, EventSection, "Query Database", sql, param, ex.Message);
                //_logger.LogError(ex, ex.Message);

                throw;
            }
        }
        public dynamic QueryFirst(IDbConnection con, string sql, object param = null, IDbTransaction transaction = null, int? commandTimeout = null, CommandType? commandType = null)
        {
            try
            {
                var result = con.QueryFirst(sql, param, transaction, commandTimeout, commandType);

                _eventLogService.AddEventLog(EventLogCategory.DATABASE, EventSection, "Query Database", sql, param);

                return result;
            }
            catch (Exception ex)
            {
                _eventLogService.AddEventLog(EventLogCategory.ERROR, EventSection, "Query Database", sql, param, ex.Message);
                //_logger.LogError(ex, ex.Message);

                throw;
            }
        }
        public IDataReader ExecuteReader(IDbConnection con, string sql, object param = null, IDbTransaction transaction = null, int? commandTimeout = null, CommandType? commandType = null)
        {
            try
            {
                var result = con.ExecuteReader(sql, param, transaction, commandTimeout, commandType);

                _eventLogService.AddEventLog(EventLogCategory.DATABASE, EventSection, "Execute Query", sql, param);

                return result;
            }
            catch (Exception ex)
            {
                _eventLogService.AddEventLog(EventLogCategory.ERROR, EventSection, "Execute Query", sql, param, ex.Message);
                //_logger.LogError(ex, ex.Message);

                throw;
            }
        }
        public object ExecuteScalar(IDbConnection con, string sql, object param = null, IDbTransaction transaction = null, int? commandTimeout = null, CommandType? commandType = null)
        {
            try
            {
                var result = con.ExecuteScalar(sql, param, transaction, commandTimeout, commandType);

                _eventLogService.AddEventLog(EventLogCategory.DATABASE, EventSection, "Execute Query", sql, param);

                return result;
            }
            catch (Exception ex)
            {
                _eventLogService.AddEventLog(EventLogCategory.ERROR, EventSection, "Execute Query", sql, param, ex.Message);
                //_logger.LogError(ex, ex.Message);

                throw;
            }
        }
        public int Execute(IDbConnection con, string sql, object param = null, IDbTransaction transaction = null, int? commandTimeout = null, CommandType? commandType = null)
        {
            try
            {
                var affected = con.Execute(sql, param, transaction, commandTimeout, commandType);

                _eventLogService.AddEventLog(EventLogCategory.DATABASE, EventSection, "Execute Query", sql, param, $"{affected} rows affected.");

                return affected;
            }
            catch (Exception ex)
            {
                _eventLogService.AddEventLog(EventLogCategory.ERROR, EventSection, "Execute Query", sql, param, ex.Message);
                //_logger.LogError(ex, ex.Message);

                throw;
            }
        }
    }
}
