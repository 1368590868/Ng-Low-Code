using AutoMapper;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Models.PortalItem;
using DataEditorPortal.Web.Models.UniversalGrid;
using System.Data.Common;

namespace DataEditorPortal.Web.Common.MapperProfiles
{
    public class PortalProfile : Profile
    {
        public PortalProfile()
        {
            CreateMap<SiteMenu, PortalItemData>().ReverseMap();
            CreateMap<DbColumn, DataSourceTableColumn>();
            CreateMap<DetailConfig, GridConfig>();
            CreateMap<SiteMenu, SiteMenu>()
                .ForMember(d => d.Parent, opt => opt.Ignore()); ;
            CreateMap<UniversalGridConfiguration, UniversalGridConfiguration>()
                .ForMember(d => d.DataSourceConnection, opt => opt.Ignore());
            CreateMap<Lookup, Lookup>()
                .ForMember(d => d.DataSourceConnection, opt => opt.Ignore());
            CreateMap<SavedSearch, SavedSearch>();
        }
    }
}
