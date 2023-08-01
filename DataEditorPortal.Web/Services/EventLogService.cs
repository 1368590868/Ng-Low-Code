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
        string CurrentUsername { get; set; }
        void AddPageRequestLog(EventLogModel model);
        void AddEventLog(string category, string section, string name, string details = null, object param = null, string result = "");
    }

    public class EventLogService : IEventLogService
    {
        private IHttpContextAccessor _httpContextAccessor;
        private readonly DepDbContext _depDbContext;
        private readonly ILogger<EventLogService> _logger;

        public string CurrentUsername { get; set; }

        public EventLogService(
            IHttpContextAccessor httpContextAccessor,
            DepDbContext depDbContext,
            ILogger<EventLogService> logger)
        {
            _httpContextAccessor = httpContextAccessor;
            _depDbContext = depDbContext;
            _logger = logger;

            if (_httpContextAccessor.HttpContext != null && _httpContextAccessor.HttpContext.User != null)
                CurrentUsername = AppUser.ParseUsername(_httpContextAccessor.HttpContext.User.Identity.Name).Username;
        }

        public void AddPageRequestLog(EventLogModel model)
        {
            try
            {
                _depDbContext.Add(new EventLog()
                {
                    Category = EventLogCategory.PAGE_REQUEST,
                    EventSection = model.Section.ToUpper(),
                    EventName = model.Action,
                    EventTime = DateTime.UtcNow,
                    Username = CurrentUsername,
                    Details = model.Details,
                    Params = FormatJson(model.Params)
                });
                _depDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
            }
        }

        private string FormatJson(string jsonString)
        {
            if (string.IsNullOrEmpty(jsonString)) return "";
            try
            {
                var json = JsonSerializer.Deserialize<object>(jsonString);
                return JsonSerializer.Serialize(json, new JsonSerializerOptions() { WriteIndented = true });
            }
            catch
            {
                return jsonString;
            }
        }

        public void AddEventLog(string category, string section, string name, string details = null, object param = null, string result = "")
        {
            try
            {
                _depDbContext.Add(new EventLog()
                {
                    Category = category,
                    EventSection = section.ToUpper(),
                    EventName = name,
                    EventTime = DateTime.UtcNow,
                    Username = CurrentUsername,
                    Details = details,
                    Params = param != null ? JsonSerializer.Serialize(param, new JsonSerializerOptions() { WriteIndented = true }) : "",
                    Result = result
                });
                _depDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
            }
        }
    }
}
