using DataEditorPortal.Web.Models.UniversalGrid;
using System.Collections.Generic;
using System.Data;

namespace DataEditorPortal.Web.Services
{
    public interface IQueryBuilder
    {
        // ultilities
        string UsePagination(string query, int startIndex, int indexCount, List<SortParam> sortParams);
        string UseOrderBy(string query, List<SortParam> sortParams = null);
        string UseFilters(string query, List<FilterParam> filterParams = null);
        string UseSearches(string query, List<SearchParam> filterParams = null);
        object FormatValue(object value, DataRow schema);

        // universal grid
        string GenerateSqlTextForList(DataSourceConfig config);
        string GenerateSqlTextForDetail(DataSourceConfig config);
        string GenerateSqlTextForInsert(DataSourceConfig config);
        string GenerateSqlTextForUpdate(DataSourceConfig config);
        string GenerateSqlTextForDelete(DataSourceConfig config);

        string GenerateSqlTextForColumnFilterOption(DataSourceConfig config);

        // database
        string GetSqlTextForDatabaseTables();
        string GetSqlTextForDatabaseSource(DataSourceConfig config);
    }
}
