using Facade.AccountManagement.Contracts.Services;
using Facade.AccountManagement.Services.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Facade.AccountManagement.DI;

// DI-класс для подключения AccountManagement фасада одной строкой
public static class AccountManagementFacadeServiceCollectionExtensions
{
    // Метод расширения для регистрации сервисов фасада
    public static IServiceCollection AddAccountManagementFacade(this IServiceCollection services)
    {
        // Регистрируем сервис фасада:
        // когда нужен IAccountManagementService — создать AccountManagementService
        services.AddScoped<IAccountManagementService, AccountManagementService>();

        // Возвращаем services, чтобы можно было продолжать цепочку регистрации
        return services;
    }
}