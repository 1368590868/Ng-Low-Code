using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Microsoft.Extensions.Configuration;
using System;

namespace DataEditorPortal.Data.Common
{
    public interface IUtcLocalConverter
    {
        ValueConverter Converter { get; }
        ValueConverter NullableConverter { get; }
    }

    public class UtcLocalConverter : IUtcLocalConverter
    {
        private string _dateTimeKind = "Local";

        public UtcLocalConverter(IConfiguration configuration)
        {
            if (configuration != null)
            {
                var dtConfig = configuration.GetSection("DateTimeKindInDB");
                if (dtConfig != null) _dateTimeKind = dtConfig.Value;
            }
        }

        public ValueConverter Converter
        {
            get
            {
                if (_dateTimeKind == "Utc")
                    return new ValueConverter<DateTime, DateTime>(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
                else
                    return new ValueConverter<DateTime, DateTime>(v => v.ToLocalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Local));
            }
        }

        public ValueConverter NullableConverter
        {
            get
            {
                if (_dateTimeKind == "Utc")
                    return new ValueConverter<DateTime?, DateTime?>(v => v.HasValue ? v.Value.ToUniversalTime() : v, v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v);
                else
                    return new ValueConverter<DateTime?, DateTime?>(v => v.HasValue ? v.Value.ToLocalTime() : v, v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Local) : v);
            }
        }
    }
}
