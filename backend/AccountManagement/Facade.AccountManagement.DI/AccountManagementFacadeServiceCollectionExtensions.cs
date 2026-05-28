using Facade.AccountManagement.Contracts.Services;
using Facade.AccountManagement.Services.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Facade.AccountManagement.DI;

/// <summary>
/// Регистрирует facade-слой AccountManagement (BFF).
/// Здесь подключается orchestration service без доступа к DataAccess.
/// </summary>
public static class AccountManagementFacadeServiceCollectionExtensions
{
    public static IServiceCollection AddAccountManagementFacade(this IServiceCollection services)
    {
        services.AddScoped<IAccountManagementService, AccountManagementService>();

        return services;
    }
}
//этот DI-файл заранее объяснил программе:
//если просят IAccountManagementService, дай AccountManagementService.
//Внедрение зависимостей — это когда класс не создаёт нужные ему объекты сам, а получает их готовыми снаружи.