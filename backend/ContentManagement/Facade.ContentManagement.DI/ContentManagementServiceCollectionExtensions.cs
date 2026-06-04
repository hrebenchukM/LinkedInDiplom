using Facade.ContentManagement.Contracts.Services;
using Facade.ContentManagement.Services.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Facade.ContentManagement.DI;

/// <summary>
/// Регистрирует facade-слой ContentManagement.
/// Нужен для BFF orchestration над ContentClient.
/// </summary>
public static class ContentManagementServiceCollectionExtensions
{
    public static IServiceCollection AddContentManagementFacade(this IServiceCollection services)
    {
        services.AddScoped<IContentManagementService, ContentManagementService>();

        return services;
    }
}
