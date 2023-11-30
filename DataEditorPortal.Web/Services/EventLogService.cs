using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Common;
using DataEditorPortal.Web.Models;
using Microsoft.Extensions.Logging;
using System;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

namespace DataEditorPortal.Web.Services
{
    public interface IEventLogService
    {
        void AddPageRequestLog(EventLogModel model);
        void AddEventLog(string category, string section, string name, string details = null, object param = null, string result = "", string connection = "");
    }

    public class EventLogService : IEventLogService
    {
        private readonly DepDbContext _depDbContext;
        private readonly ILogger<EventLogService> _logger;
        private readonly ICurrentUserAccessor _currentUserAccessor;

        private string _currentUsername;

        public EventLogService(
            DepDbContext depDbContext,
            ILogger<EventLogService> logger,
            ICurrentUserAccessor currentUserAccessor)
        {
            _depDbContext = depDbContext;
            _logger = logger;

            _currentUserAccessor = currentUserAccessor;
            _currentUsername = AppUser.ParseUsername(_currentUserAccessor.CurrentUser.Identity.Name).Username;
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
                    Username = _currentUsername,
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

        public void AddEventLog(string category, string section, string name, string details = null, object param = null, string result = "", string connection = "")
        {
            try
            {
                string pattern = @"(Pwd|Password)=(\w+)";
                string replacement = "$1=******";

                _depDbContext.Add(new EventLog()
                {
                    Category = category,
                    EventSection = section.ToUpper(),
                    EventName = name,
                    EventTime = DateTime.UtcNow,
                    Username = _currentUsername,
                    Details = details,
                    Params = param != null ? JsonSerializer.Serialize(param, new JsonSerializerOptions() { WriteIndented = true, Converters = { new ByteArrayToStringConverter() } }) : "",
                    Result = result,
                    Connection = connection != null ? Regex.Replace(connection, pattern, replacement, RegexOptions.IgnoreCase) : ""
                });
                _depDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
            }
        }

        // in order to handle byte[] and byte[16] (RAW(16) GUID in oracle)
        class ByteArrayToStringConverter : JsonConverter<byte[]>
        {
            public override byte[] Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
            {
                throw new NotSupportedException();
            }

            public override void Write(Utf8JsonWriter writer, byte[] value, JsonSerializerOptions options)
            {
                if (value.Length == 16)
                {
                    writer.WriteStringValue(Convert.ToHexString(value));
                }
                else
                {
                    writer.WriteStringValue("... FILE BYTES ...");
                }
            }
        }
    }
}
