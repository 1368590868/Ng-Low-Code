using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ModelBinding.Binders;
using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace DataEditorPortal.Web.Common
{
    public class HexStringGuidBinderProvider : IModelBinderProvider
    {
        public IModelBinder GetBinder(ModelBinderProviderContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException(nameof(context));
            }

            if (context.Metadata.ModelType == typeof(Guid) || context.Metadata.ModelType == typeof(Guid?))
            {
                return new BinderTypeModelBinder(typeof(HexStringGuidModelBinder));
            }

            return null;
        }
    }

    public class HexStringGuidModelBinder : IModelBinder
    {
        public Task BindModelAsync(ModelBindingContext bindingContext)
        {
            if (bindingContext == null)
            {
                throw new ArgumentNullException(nameof(bindingContext));
            }

            var valueProviderResult = bindingContext.ValueProvider.GetValue(bindingContext.ModelName);

            if (valueProviderResult == ValueProviderResult.None)
            {
                return Task.CompletedTask;
            }

            var valueAsString = valueProviderResult.FirstValue;

            if (string.IsNullOrEmpty(valueAsString))
            {
                return Task.CompletedTask;
            }

            if (IsHexadecimal(valueAsString))
            {
                var bytes = Convert.FromHexString(valueAsString);
                if (bytes.Length == 16)
                {
                    bindingContext.Result = ModelBindingResult.Success(new Guid(bytes));
                    return Task.CompletedTask;
                }
            }

            if (!Guid.TryParse(valueAsString, out var result))
            {
                bindingContext.ModelState.TryAddModelError(bindingContext.ModelName, "Invalid GUID format.");
                return Task.CompletedTask;
            }

            bindingContext.Result = ModelBindingResult.Success(result);
            return Task.CompletedTask;
        }

        bool IsHexadecimal(string input)
        {
            // Remove optional "0x" or "0X" prefix
            input = input.TrimStart().ToUpperInvariant().Replace("0X", "");

            // Check if the remaining string is a valid hexadecimal
            return Regex.IsMatch(input, "^[0-9A-F]+$");
        }
    }
}
