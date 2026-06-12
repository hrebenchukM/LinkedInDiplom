using Content.Events.Contracts.Events;
using Identity.Events.Contracts.Abstractions;
using Notifications.Contracts.Parameters.Notification;
using Notifications.Contracts.Services;

namespace Notifications.Services.EventHandlers;

public class CreateNotificationOnReactionUpsertedHandler
    : IDomainEventHandler<ReactionUpsertedEvent>
{
    private readonly INotificationService _notificationService;

    public CreateNotificationOnReactionUpsertedHandler(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    public async Task HandleAsync(
        ReactionUpsertedEvent domainEvent,
        CancellationToken cancellationToken = default)
    {
        if (!domainEvent.IsNewReaction)
        {
            return;
        }

        if (domainEvent.ActorUserId == domainEvent.PostAuthorUserId)
        {
            return;
        }

        await _notificationService.CreateAsync(new CreateNotificationParameters
        {
            UserId = domainEvent.PostAuthorUserId,
            ActorUserId = domainEvent.ActorUserId,
            Type = "post_reaction",
            Title = "New reaction on your post",
            Body = "Someone reacted to your post.",
            EntityType = "post",
            EntityId = domainEvent.PostId
        });
    }
}
