using Facade.AdminManagement.Contracts.Services;
using Facade.AdminManagement.Services.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Facade.AdminManagement.DI;

public static class AdminManagementFacadeServiceCollectionExtensions
{
    public static IServiceCollection AddAdminManagementFacade(this IServiceCollection services)
    {
        services.AddScoped<IAdminManagementService, AdminManagementService>();

        return services;
    }
}
