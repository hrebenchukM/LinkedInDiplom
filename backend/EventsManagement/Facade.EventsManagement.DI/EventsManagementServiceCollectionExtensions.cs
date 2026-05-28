using Facade.EventsManagement.Contracts.Services;
using Facade.EventsManagement.Services.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Facade.EventsManagement.DI;

public static class EventsManagementServiceCollectionExtensions
{
    public static IServiceCollection AddEventsManagementFacade(this IServiceCollection services)
    {
        services.AddScoped<IEventsManagementService, EventsManagementService>();

        return services;
    }
}
