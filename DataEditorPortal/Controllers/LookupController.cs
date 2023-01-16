using DataEditorPortal.Data.Contexts;
using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;

namespace DataEditorPortal.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LookupController : ControllerBase
    {
        private readonly ILogger<UserController> _logger;
        private readonly DepDbContext _depDbContext;
        private readonly IConfiguration _config;

        public LookupController(ILogger<UserController> logger, DepDbContext depDbContext, IConfiguration config)
        {
            _logger = logger;
            _depDbContext = depDbContext;
            _config = config;
        }

        [HttpGet]
        [Route("list")]
        public List<Lookup> GetLookups()
        {
            return _depDbContext.Lookups
                .Select(x => new Lookup() { Id = x.Id, Name = x.Name })
                .ToList();
        }

        [HttpPut]
        [Route("create")]
        public dynamic Create()
        {
            string version = Assembly.GetExecutingAssembly().GetName().Version.ToString();

            var filePath = Assembly.GetExecutingAssembly().Location;
            var date = new FileInfo(filePath).LastWriteTime.ToShortDateString();

            return new
            {
                version,
                date
            };
        }

        [HttpPost]
        [Route("{id}/update")]
        public dynamic Update(Guid id, Lookup model)
        {
            var menus = _depDbContext.SiteMenus.ToList();

            var root = menus
                .Where(x => x.ParentId == null)
                .OrderBy(x => x.Order)
                .ThenBy(x => x.Name)
                .Select(x =>
                {
                    var items = menus
                            .Where(m => m.ParentId == x.Id)
                            .OrderBy(x => x.Order)
                            .ThenBy(x => x.Name)
                            .Select(m => new
                            {
                                id = m.Id,
                                name = m.Name,
                                label = m.Label,
                                icon = m.Icon,
                                title = m.Description,
                                routerLink = new string[] { $"/portal-item/{m.Name.ToLower()}" }
                            });

                    return new
                    {
                        id = x.Id,
                        name = x.Name,
                        label = x.Label,
                        icon = x.Icon,
                        title = x.Description,
                        items = items.Any() ? items : null,
                        routerLink = items.Any() ? null : new string[] { $"/portal-item/{x.Name.ToLower()}" },
                    };
                });

            return root;
        }

        [HttpPost]
        [Route("{id}/options")]
        public dynamic GetLookup(Guid id, [FromBody] Dictionary<string, object> model)
        {
            var lookup = _depDbContext.Lookups.Find(id);

            var result = new List<DropdownOptionsItem>();

            if (lookup != null)
            {
                using (var con = _depDbContext.Database.GetDbConnection())
                {
                    con.Open();
                    var cmd = con.CreateCommand();
                    cmd.Connection = con;
                    cmd.CommandText = lookup.QueryText;

                    try
                    {
                        if (model != null)
                        {
                            // add param
                            foreach (var p in model)
                            {
                                if (p.Value != null)
                                {
                                    var param = cmd.CreateParameter();
                                    param.ParameterName = p.Key;
                                    param.Value = p.Value.ToString();
                                    cmd.Parameters.Add(param);
                                }
                            }
                        }

                        using (var dr = cmd.ExecuteReader())
                        {
                            while (dr.Read())
                            {
                                var row = new DropdownOptionsItem();
                                row.Label = dr[0].ToString();
                                row.Value = dr[1].ToString(); ;
                                if (dr.FieldCount > 2)
                                {
                                    row.Value2 = dr[2].ToString(); ;
                                }
                                if (dr.FieldCount > 3)
                                {
                                    row.Value3 = dr[3].ToString(); ;
                                }
                                result.Add(row);
                            }
                        }

                    }
                    catch (Exception ex)
                    {
                        throw new Exception("An Error in the query has occurred: " + ex.Message);
                    }
                }
            }

            return result;
        }

    }
}
