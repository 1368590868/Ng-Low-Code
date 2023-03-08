
using System;
using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace DataEditorPortal.Web.Common
{
    /// <summary>
    /// Converts a <see cref="DateTime"/> to and from the ISO 8601 date format (e.g. <c>"2008-04-12T12:53Z"</c>).
    /// </summary>
    public class IsoDateTimeConverter : JsonConverter<DateTime>
    {
        private const string DefaultDateTimeFormat = "yyyy'-'MM'-'dd'T'HH':'mm':'ss.FFFFFFFK";

        private DateTimeStyles _dateTimeStyles = DateTimeStyles.AdjustToUniversal;
        private string? _dateTimeFormat;
        private CultureInfo? _culture;

        /// <summary>
        /// Gets or sets the date time styles used when converting a date to and from JSON.
        /// </summary>
        /// <value>The date time styles used when converting a date to and from JSON.</value>
        public DateTimeStyles DateTimeStyles
        {
            get => _dateTimeStyles;
            set => _dateTimeStyles = value;
        }

        /// <summary>
        /// Gets or sets the date time format used when converting a date to and from JSON.
        /// </summary>
        /// <value>The date time format used when converting a date to and from JSON.</value>
        public string? DateTimeFormat
        {
            get => _dateTimeFormat ?? string.Empty;
            set => _dateTimeFormat = (string.IsNullOrEmpty(value)) ? null : value;
        }

        /// <summary>
        /// Gets or sets the culture used when converting a date to and from JSON.
        /// </summary>
        /// <value>The culture used when converting a date to and from JSON.</value>
        public CultureInfo Culture
        {
            get => _culture ?? CultureInfo.CurrentCulture;
            set => _culture = value;
        }

        public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
        {
            string text;

            if (value is DateTime dateTime)
            {
                if ((_dateTimeStyles & DateTimeStyles.AdjustToUniversal) == DateTimeStyles.AdjustToUniversal
                    || (_dateTimeStyles & DateTimeStyles.AssumeUniversal) == DateTimeStyles.AssumeUniversal)
                {
                    dateTime = dateTime.ToUniversalTime();
                }

                text = dateTime.ToString(_dateTimeFormat ?? DefaultDateTimeFormat, Culture);
            }
            else
            {
                throw new Exception($"Unexpected value when converting date. Expected DateTime, got {value.GetType()}.");
            }

            writer.WriteStringValue(text);
        }


        public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType != JsonTokenType.String)
            {
                throw new Exception($"Unexpected token parsing date. Expected String, got {reader.TokenType}.");
            }

            string dateText = reader.GetString();

            if (string.IsNullOrEmpty(dateText))
            {
                throw new Exception($"Unexpected value when parsing date. Expected DateTime, got null.");
            }

            if (!string.IsNullOrEmpty(_dateTimeFormat))
            {
                return DateTime.ParseExact(dateText, _dateTimeFormat, Culture, _dateTimeStyles);
            }
            else
            {
                return DateTime.Parse(dateText, Culture, _dateTimeStyles);
            }
        }
    }
}