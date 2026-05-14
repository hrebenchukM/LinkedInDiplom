using Facade.AccountManagement.Contracts.Services;
using Facade.AccountManagement.Services.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Facade.AccountManagement.DI;

public static class AccountManagementFacadeServiceCollectionExtensions
{
    public static IServiceCollection AddAccountManagementFacade(this IServiceCollection services)
    {
        // Register Facade Services
        services.AddScoped<IAccountManagementService, AccountManagementService>();

        return services;
    }
}
