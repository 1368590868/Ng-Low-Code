using System;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

namespace DataEditorPortal.Web.Common.Json
{
    public sealed class HexStringGuidConverter : JsonConverter<Guid>
    {
        public override Guid Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType != JsonTokenType.String)
            {
                throw new Exception($"Unexpected token parsing guid. Expected String, got {reader.TokenType}.");
            }

            string guidText = reader.GetString();

            if (string.IsNullOrEmpty(guidText))
            {
                throw new Exception($"Unexpected value when parsing guid. Expected String, got null.");
            }

            if (IsHexadecimal(guidText))
            {
                var bytes = Convert.FromHexString(guidText);
                if (bytes.Length == 16) { return new Guid(bytes); }
            }

            return reader.GetGuid();
        }

        public override void Write(Utf8JsonWriter writer, Guid value, JsonSerializerOptions options)
        {
            writer.WriteStringValue(value);
        }

        bool IsHexadecimal(string input)
        {
            // Remove optional "0x" or "0X" prefix
            input = input.TrimStart().ToUpperInvariant().Replace("0X", "");

            // Check if the remaining string is a valid hexadecimal
            return Regex.IsMatch(input, "^[0-9A-F]+$");
        }

        //public override Guid ReadAsPropertyNameCore(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        //{
        //    return reader.GetGuidNoValidation();
        //}

        //internal override void WriteAsPropertyNameCore(Utf8JsonWriter writer, Guid value, JsonSerializerOptions options, bool isWritingExtensionDataProperty)
        //{
        //    writer.WritePropertyName(value);
        //}
    }
}
