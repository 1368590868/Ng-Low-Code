using AutoMapper;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Models;

namespace DataEditorPortal.Web.Common.MapperProfiles
{
    public class CommonProfile : Profile
    {
        public CommonProfile()
        {
            CreateMap<SiteMenu, MenuItem>();
        }
    }
}
