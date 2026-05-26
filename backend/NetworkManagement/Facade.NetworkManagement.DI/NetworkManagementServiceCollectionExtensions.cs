using Facade.NetworkManagement.Contracts.Services;
using Facade.NetworkManagement.Services.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Facade.NetworkManagement.DI;

// DI-класс для подключения NetworkManagement фасада одной строкой
public static class NetworkManagementServiceCollectionExtensions
{
    public static IServiceCollection AddNetworkManagementFacade(this IServiceCollection services)
    {
        services.AddScoped<INetworkManagementService, NetworkManagementService>();

        return services;
    }
}
