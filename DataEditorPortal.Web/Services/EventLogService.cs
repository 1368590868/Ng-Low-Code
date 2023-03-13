using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Text.Json;

namespace DataEditorPortal.Web.Services
{
    public interface IEventLogService
    {
        void AddPageRequestLog(EventLogModel model);
        void AddDdCommandLog(DbCommand cmd, string category, string section, string result = "");
    }

    public class EventLogService : IEventLogService
    {
        private IHttpContextAccessor _httpContextAccessor;
        private readonly DepDbContext _depDbContext;
        private readonly ILogger<EventLogService> _logger;

        public EventLogService(
            IHttpContextAccessor httpContextAccessor,
            DepDbContext depDbContext,
            ILogger<EventLogService> logger)
        {
            _httpContextAccessor = httpContextAccessor;
            _depDbContext = depDbContext;
            _logger = logger;
        }

        public void AddPageRequestLog(EventLogModel model)
        {
            try
            {
                var username = string.Empty;
                if (_httpContextAccessor.HttpContext.User != null && _httpContextAccessor.HttpContext.User.Identity != null)
                    username = AppUser.ParseUsername(_httpContextAccessor.HttpContext.User.Identity.Name).Username;

                _depDbContext.Add(new EventLog()
                {
                    Category = EventLogCategory.PAGE_REQUEST,
                    EventSection = model.Section.Replace("-", "_").ToUpper(),
                    EventName = model.Action,
                    EventTime = DateTime.UtcNow,
                    Username = username,
                    Details = model.Details,
                    Params = model.Params
                });
                _depDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message, ex);
            }
        }

        public void AddDdCommandLog(DbCommand cmd, string category, string section, string result = "")
        {
            try
            {
                var username = string.Empty;
                if (_httpContextAccessor.HttpContext.User != null && _httpContextAccessor.HttpContext.User.Identity != null)
                    username = AppUser.ParseUsername(_httpContextAccessor.HttpContext.User.Identity.Name).Username;

                Dictionary<string, string> parameters = new Dictionary<string, string>();
                foreach (DbParameter item in cmd.Parameters)
                {
                    parameters[item.ParameterName] = item.Value?.ToString();
                }

                _depDbContext.Add(new EventLog()
                {
                    Category = category,
                    EventSection = section.Replace("-", "_").ToUpper(),
                    EventName = "Database Command",
                    EventTime = DateTime.UtcNow,
                    Username = username,
                    Details = cmd.CommandText,
                    Params = JsonSerializer.Serialize(parameters),
                    Result = result
                });
                _depDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message, ex);
            }
        }
    }
}
