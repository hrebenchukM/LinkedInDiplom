using Facade.NetworkManagement.Contracts.Services;
using Facade.NetworkManagement.Services.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Facade.NetworkManagement.DI;

public static class NetworkManagementServiceCollectionExtensions
{
    public static IServiceCollection AddNetworkManagementFacade(this IServiceCollection services)
    {
        services.AddScoped<INetworkManagementService, NetworkManagementService>();

        return services;
    }
}
