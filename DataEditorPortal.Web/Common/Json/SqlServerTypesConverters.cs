using Microsoft.SqlServer.Types;
using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace DataEditorPortal.Web.Common.Json
{
    public class SqlGeometryConverter : JsonConverter<SqlGeometry>
    {
        public override void Write(Utf8JsonWriter writer, SqlGeometry value, JsonSerializerOptions options)
        {
            string text = value != null ? value.ToString() : null;
            writer.WriteStringValue(text);
        }


        public override SqlGeometry Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            throw new NotImplementedException();
        }
    }

    public class SqlHierarchyIdConverter : JsonConverter<SqlHierarchyId>
    {
        public override void Write(Utf8JsonWriter writer, SqlHierarchyId value, JsonSerializerOptions options)
        {
            string text = value.IsNull ? null : value.ToString();
            writer.WriteStringValue(text);
        }


        public override SqlHierarchyId Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            throw new NotImplementedException();
        }
    }

    public class SqlGeographyConverter : JsonConverter<SqlGeography>
    {
        public override void Write(Utf8JsonWriter writer, SqlGeography value, JsonSerializerOptions options)
        {
            string text = value != null ? value.ToString() : null;
            writer.WriteStringValue(text);
        }


        public override SqlGeography Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            throw new NotImplementedException();
        }
    }
}