using Facade.ContentManagement.Contracts.Services;
using Facade.ContentManagement.Services.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Facade.ContentManagement.DI;

public static class ContentManagementServiceCollectionExtensions
{
    public static IServiceCollection AddContentManagementFacade(this IServiceCollection services)
    {
        services.AddScoped<IContentManagementService, ContentManagementService>();

        return services;
    }
}
