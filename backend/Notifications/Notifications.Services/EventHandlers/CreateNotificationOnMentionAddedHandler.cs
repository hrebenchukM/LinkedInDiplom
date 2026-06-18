using Content.Events.Contracts.Events;
using Identity.Events.Contracts.Abstractions;
using Notifications.Contracts.Parameters.Notification;
using Notifications.Contracts.Services;

namespace Notifications.Services.EventHandlers;

public class CreateNotificationOnMentionAddedHandler
    : IDomainEventHandler<MentionAddedEvent>
{
    private readonly INotificationService _notificationService;

    public CreateNotificationOnMentionAddedHandler(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    public async Task HandleAsync(
        MentionAddedEvent domainEvent,
        CancellationToken cancellationToken = default)
    {
        if (domainEvent.MentionedUserId == domainEvent.ActorUserId)
        {
            return;
        }

        await _notificationService.CreateAsync(new CreateNotificationParameters
        {
            UserId = domainEvent.MentionedUserId,
            ActorUserId = domainEvent.ActorUserId,
            Type = "post_mention",
            Title = "You were mentioned in a post",
            Body = "Someone mentioned you in a post.",
            EntityType = "post",
            EntityId = domainEvent.PostId
        });
    }
}
