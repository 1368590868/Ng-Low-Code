using AutoMapper;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Models.PortalItem;

namespace DataEditorPortal.Web.Common.MapperProfiles
{
    public class PortalProfile : Profile
    {
        public PortalProfile()
        {
            CreateMap<SiteMenu, PortalItemData>().ReverseMap();
        }
    }
}
