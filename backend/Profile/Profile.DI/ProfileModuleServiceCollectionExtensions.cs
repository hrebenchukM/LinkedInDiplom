using Identity.Events.Contracts.Abstractions;
using Identity.Events.Contracts.Events;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Profile.Client;
using Profile.Client.Contracts;
using Profile.Client.Contracts.Resources;
using Profile.Client.Resources;
using Profile.Contracts.Services;
using Profile.DataAccess;
using Profile.Services.EventHandlers;
using Profile.Services.Services;

namespace Profile.DI;

public static class ProfileModuleServiceCollectionExtensions
{
    public static IServiceCollection AddProfileModule(
        this IServiceCollection services,
        IConfiguration configuration,
        string connectionString)
    {
        services.AddDbContext<ProfileDbContext>(options =>
            options.UseNpgsql(
                connectionString,
                npgsqlOptions => npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "profile")));

        services.AddScoped<IProfileService, ProfileService>();
        services.AddScoped<IMessageSettingsService, MessageSettingsService>();
        services.AddScoped<IProfileViewService, ProfileViewService>();

        // Profile creates an empty profile when Identity publishes UserRegisteredEvent.
        services.AddScoped<
            IDomainEventHandler<UserRegisteredEvent>,
            CreateEmptyProfileWhenUserRegisteredHandler>();

        services.AddScoped<IProfileResource, ProfileResource>();
        services.AddScoped<IMessageSettingsResource, MessageSettingsResource>();
        services.AddScoped<IProfileViewResource, ProfileViewResource>();

        services.AddScoped<IProfileClient, ProfileClient>();

        return services;
    }
}
