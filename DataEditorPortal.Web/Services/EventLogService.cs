using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Text.Json;

namespace DataEditorPortal.Web.Services
{
    public interface IEventLogService
    {
        void AddPageRequestLog(EventLogModel model);
        void AddDbQueryLog(string category, string section, string details, object param = null, string result = "");
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

        public void AddDbQueryLog(string category, string section, string details, object param = null, string result = "")
        {
            try
            {
                var username = string.Empty;
                if (_httpContextAccessor.HttpContext.User != null && _httpContextAccessor.HttpContext.User.Identity != null)
                    username = AppUser.ParseUsername(_httpContextAccessor.HttpContext.User.Identity.Name).Username;

                _depDbContext.Add(new EventLog()
                {
                    Category = category,
                    EventSection = section.Replace("-", "_").ToUpper(),
                    EventName = "Database Query",
                    EventTime = DateTime.UtcNow,
                    Username = username,
                    Details = details,
                    Params = param != null ? JsonSerializer.Serialize(param) : "",
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
