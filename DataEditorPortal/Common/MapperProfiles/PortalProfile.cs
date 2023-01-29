using AutoMapper;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Models.PortalItem;
using System.Data.Common;

namespace DataEditorPortal.Web.Common.MapperProfiles
{
    public class PortalProfile : Profile
    {
        public PortalProfile()
        {
            CreateMap<SiteMenu, PortalItemData>().ReverseMap();
            CreateMap<DbColumn, DataSourceTableColumn>();
        }
    }
}
