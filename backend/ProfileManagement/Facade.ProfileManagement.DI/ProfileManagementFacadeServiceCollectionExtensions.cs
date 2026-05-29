using Facade.ProfileManagement.Contracts.Services;
using Facade.ProfileManagement.Services.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Facade.ProfileManagement.DI;

// DI-класс для подключения ProfileManagement фасада одной строкой
public static class ProfileManagementFacadeServiceCollectionExtensions
{
    public static IServiceCollection AddProfileManagementFacade(this IServiceCollection services)
    {
        services.AddScoped<IProfileManagementService, ProfileManagementService>();

        return services;
    }
}