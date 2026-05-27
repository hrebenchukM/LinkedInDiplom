using Facade.MessagingManagement.Contracts.Services;
using Facade.MessagingManagement.Services.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Facade.MessagingManagement.DI;

public static class MessagingManagementServiceCollectionExtensions
{
    public static IServiceCollection AddMessagingManagementFacade(this IServiceCollection services)
    {
        services.AddScoped<IMessagingManagementService, MessagingManagementService>();
        return services;
    }
}
