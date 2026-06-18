using Content.Events.Contracts.Events;
using Identity.Events.Contracts.Abstractions;
using Jobs.Events.Contracts.Events;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Network.Events.Contracts.Events;
using Notifications.Client;
using Notifications.Client.Contracts;
using Notifications.Client.Contracts.Resources;
using Notifications.Client.Resources;
using Notifications.Contracts.Services;
using Notifications.Contracts.Realtime;
using Notifications.DataAccess;
using Notifications.Services.Realtime;
using Notifications.Services.EventHandlers;
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

        services.AddScoped<INotificationCreatedPublisher, NullNotificationCreatedPublisher>();

        services.AddScoped<
            IDomainEventHandler<CommentCreatedEvent>,
            CreateNotificationOnCommentCreatedHandler>();

        services.AddScoped<
            IDomainEventHandler<ContactRequestSentEvent>,
            CreateNotificationOnContactRequestSentHandler>();

        services.AddScoped<
            IDomainEventHandler<ContactRequestAcceptedEvent>,
            CreateNotificationOnContactRequestAcceptedHandler>();

        services.AddScoped<
            IDomainEventHandler<ReactionUpsertedEvent>,
            CreateNotificationOnReactionUpsertedHandler>();

        services.AddScoped<
            IDomainEventHandler<MentionAddedEvent>,
            CreateNotificationOnMentionAddedHandler>();

        services.AddScoped<
            IDomainEventHandler<VacancyApplicationSubmittedEvent>,
            CreateNotificationOnVacancyApplicationSubmittedHandler>();

        return services;
    }
}
