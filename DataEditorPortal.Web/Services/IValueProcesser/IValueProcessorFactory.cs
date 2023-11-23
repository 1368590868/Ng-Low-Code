using DataEditorPortal.Data.Models;
using DataEditorPortal.Web.Models.UniversalGrid;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Data;
using System.Linq;
using System.Reflection;

namespace DataEditorPortal.Web.Services
{
    public interface IValueProcessorFactory
    {
        ValueProcessorBase CreateValueProcessor(FormFieldConfig field, UniversalGridConfiguration config, IDbConnection con, IDbTransaction trans = null);
        ValueComparerBase CreateValueComparer(FormFieldConfig field, UniversalGridConfiguration config);
        ValueProcessorBase CreateValueProcessor(Type type);
    }

    public class ValueProcessorFactory : IValueProcessorFactory
    {
        private IServiceProvider _serviceProvider;

        public ValueProcessorFactory(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public ValueProcessorBase CreateValueProcessor(FormFieldConfig field, UniversalGridConfiguration config, IDbConnection con, IDbTransaction trans = null)
        {
            var type = Assembly.GetCallingAssembly().GetTypes()
                .Where(x =>
                {
                    if (typeof(ValueProcessorBase).IsAssignableFrom(x))
                    {
                        var attr = x.GetCustomAttribute<FilterTypeAttribute>();
                        return attr != null && attr.GetFilterType() == field.filterType;
                    }
                    return false;
                })
                .FirstOrDefault();

            if (type != null)
            {
                var instance = _serviceProvider.GetRequiredService(type) as ValueProcessorBase;
                instance.Conn = con;
                instance.Trans = trans;
                instance.Config = config;
                instance.Field = field;
                return instance;
            }

            return null;
        }

        public ValueProcessorBase CreateValueProcessor(Type type)
        {
            if (!typeof(ValueProcessorBase).IsAssignableFrom(type)) throw new ArgumentException($"Type: {type.Name} is not assignable to ValueProcessorBase.");

            return _serviceProvider.GetRequiredService(type) as ValueProcessorBase;
        }

        public ValueComparerBase CreateValueComparer(FormFieldConfig field, UniversalGridConfiguration config)
        {
            var type = Assembly.GetCallingAssembly().GetTypes()
                .Where(x =>
                {
                    if (typeof(ValueComparerBase).IsAssignableFrom(x))
                    {
                        var attr = x.GetCustomAttribute<FilterTypeAttribute>();
                        return attr != null && attr.GetFilterType() == field.filterType;
                    }
                    return false;
                })
                .FirstOrDefault();

            if (type != null)
            {
                var instance = _serviceProvider.GetRequiredService(type) as ValueComparerBase;
                instance.Config = config;
                instance.Field = field;
                return instance;
            }

            return null;
        }
    }

    public static class ValueProcessorExtensions
    {
        public static void AddValueProcessors(this IServiceCollection services)
        {
            var types = Assembly.GetCallingAssembly().GetTypes()
                .Where(x => x.Name != typeof(ValueProcessorBase).Name && typeof(ValueProcessorBase).IsAssignableFrom(x));
            foreach (var type in types)
            {
                services.AddTransient(type);
            }

            types = Assembly.GetCallingAssembly().GetTypes()
                .Where(x => x.Name != typeof(ValueComparerBase).Name && typeof(ValueComparerBase).IsAssignableFrom(x));
            foreach (var type in types)
            {
                services.AddTransient(type);
            }

            services.AddScoped<IValueProcessorFactory, ValueProcessorFactory>();
        }
    }
}
