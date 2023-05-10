using AutoMapper;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Models.ImportData;

namespace DataEditorPortal.Web.Common.MapperProfiles
{
    public class ImportProfile : Profile
    {
        public ImportProfile()
        {
            CreateMap<DataImportHistory, ImportHistoryModel>()
                .ForMember(x => x.CreatedByUser, d => d.MapFrom(s => s.CreatedBy.Name))
                .ForMember(x => x.Progress, d => d.MapFrom(s => s.Status != Data.Common.DataImportResult.InProgress ? 100 : 0));
        }
    }
}
