using Events.Client;
using Events.Client.Contracts;
using Events.Client.Contracts.Resources;
using Events.Client.Resources;
using Events.Contracts.Services;
using Events.DataAccess;
using Events.Services.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Events.DI;

public static class EventsModuleServiceCollectionExtensions
{
    public static IServiceCollection AddEventsModule(
        this IServiceCollection services,
        IConfiguration configuration,
        string connectionString)
    {
        services.AddDbContext<EventsDbContext>(options =>
            options.UseNpgsql(
                connectionString,
                npgsqlOptions => npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "events")));

        services.AddScoped<IEventService, EventService>();
        services.AddScoped<IEventAttendeeService, EventAttendeeService>();
        services.AddScoped<IEventScheduleService, EventScheduleService>();
        services.AddScoped<IEventSpeakerService, EventSpeakerService>();
        services.AddScoped<IEventSpeakerMapService, EventSpeakerMapService>();
        services.AddScoped<IEventResource, EventResource>();
        services.AddScoped<IEventAttendeeResource, EventAttendeeResource>();
        services.AddScoped<IEventScheduleResource, EventScheduleResource>();
        services.AddScoped<IEventSpeakerResource, EventSpeakerResource>();
        services.AddScoped<IEventSpeakerMapResource, EventSpeakerMapResource>();
        services.AddScoped<IEventsClient, EventsClient>();

        return services;
    }
}
