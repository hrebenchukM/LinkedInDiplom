using Facade.ProfileManagement.Contracts.Services;
using Facade.ProfileManagement.Services.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Facade.ProfileManagement.DI;

public static class ProfileManagementFacadeServiceCollectionExtensions
{
    public static IServiceCollection AddProfileManagementFacade(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddScoped<IProfileManagementService, ProfileManagementService>();

        return services;
    }
}
