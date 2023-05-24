using Microsoft.Extensions.DependencyInjection;
using System;
using System.Linq;
using System.Reflection;

namespace DataEditorPortal.Web.Services
{
    public interface IValueProcessorFactory
    {
        public ValueProcessorBase CreateValueProcessor(string filterType);
        public ValueProcessorBase CreateValueProcessor(Type type);
    }

    public class ValueProcessorFactory : IValueProcessorFactory
    {
        private IServiceProvider _serviceProvider;

        public ValueProcessorFactory(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public ValueProcessorBase CreateValueProcessor(string filterType)
        {
            var type = Assembly.GetCallingAssembly().GetTypes()
                .Where(x =>
                {
                    if (typeof(ValueProcessorBase).IsAssignableFrom(x))
                    {
                        var attr = x.GetCustomAttribute<FilterTypeAttribute>();
                        return attr != null && attr.GetFilterType() == filterType;
                    }
                    return false;
                })
                .FirstOrDefault();

            if (type != null)
            {
                return _serviceProvider.GetRequiredService(type) as ValueProcessorBase;
            }

            return null;
        }

        public ValueProcessorBase CreateValueProcessor(Type type)
        {
            if (!typeof(ValueProcessorBase).IsAssignableFrom(type)) throw new ArgumentException($"Type: {type.Name} is not assignable to ValueProcessor.");

            return _serviceProvider.GetRequiredService(type) as ValueProcessorBase;
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

            services.AddScoped<IValueProcessorFactory, ValueProcessorFactory>();
        }
    }
}
