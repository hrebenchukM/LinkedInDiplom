using Facade.NotificationsManagement.Contracts.Services;
using Facade.NotificationsManagement.Services.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Facade.NotificationsManagement.DI;

public static class NotificationsManagementServiceCollectionExtensions
{
    public static IServiceCollection AddNotificationsManagementFacade(this IServiceCollection services)
    {
        services.AddScoped<INotificationsManagementService, NotificationsManagementService>();
        return services;
    }
}
