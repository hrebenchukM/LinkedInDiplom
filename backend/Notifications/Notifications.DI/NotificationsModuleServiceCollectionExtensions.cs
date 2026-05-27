using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Notifications.Client;
using Notifications.Client.Contracts;
using Notifications.Client.Contracts.Resources;
using Notifications.Client.Resources;
using Notifications.Contracts.Services;
using Notifications.DataAccess;
using Notifications.Services.Services;

namespace Notifications.DI;

public static class NotificationsModuleServiceCollectionExtensions
{
    public static IServiceCollection AddNotificationsModule(
        this IServiceCollection services,
        IConfiguration configuration,
        string connectionString)
    {
        services.AddDbContext<NotificationsDbContext>(options =>
            options.UseNpgsql(
                connectionString,
                npgsqlOptions => npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "notifications")));

        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IUserActivityService, UserActivityService>();
        services.AddScoped<INotificationResource, NotificationResource>();
        services.AddScoped<IUserActivityResource, UserActivityResource>();
        services.AddScoped<INotificationsClient, NotificationsClient>();

        return services;
    }
}
