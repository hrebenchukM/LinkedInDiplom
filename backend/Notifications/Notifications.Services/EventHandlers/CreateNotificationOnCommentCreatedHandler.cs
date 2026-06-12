using Content.Events.Contracts.Events;
using Identity.Events.Contracts.Abstractions;
using Notifications.Contracts.Parameters.Notification;
using Notifications.Contracts.Services;

namespace Notifications.Services.EventHandlers;

public class CreateNotificationOnCommentCreatedHandler
    : IDomainEventHandler<CommentCreatedEvent>
{
    private readonly INotificationService _notificationService;

    public CreateNotificationOnCommentCreatedHandler(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    public async Task HandleAsync(
        CommentCreatedEvent domainEvent,
        CancellationToken cancellationToken = default)
    {
        if (domainEvent.CommentAuthorUserId == domainEvent.PostAuthorUserId)
        {
            return;
        }

        await _notificationService.CreateAsync(new CreateNotificationParameters
        {
            UserId = domainEvent.PostAuthorUserId,
            ActorUserId = domainEvent.CommentAuthorUserId,
            Type = "post_comment",
            Title = "New comment on your post",
            Body = "Someone commented on your post.",
            EntityType = "post",
            EntityId = domainEvent.PostId
        });
    }
}
