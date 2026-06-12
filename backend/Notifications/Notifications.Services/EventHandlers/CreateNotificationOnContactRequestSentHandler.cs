using Identity.Events.Contracts.Abstractions;
using Network.Events.Contracts.Events;
using Notifications.Contracts.Parameters.Notification;
using Notifications.Contracts.Services;

namespace Notifications.Services.EventHandlers;

public class CreateNotificationOnContactRequestSentHandler
    : IDomainEventHandler<ContactRequestSentEvent>
{
    private readonly INotificationService _notificationService;

    public CreateNotificationOnContactRequestSentHandler(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    public async Task HandleAsync(
        ContactRequestSentEvent domainEvent,
        CancellationToken cancellationToken = default)
    {
        if (domainEvent.SenderUserId == domainEvent.ReceiverUserId)
        {
            return;
        }

        await _notificationService.CreateAsync(new CreateNotificationParameters
        {
            UserId = domainEvent.ReceiverUserId,
            ActorUserId = domainEvent.SenderUserId,
            Type = "contact_request",
            Title = "New contact request",
            Body = "Someone sent you a contact request.",
            EntityType = "contact_request",
            EntityId = domainEvent.ContactRequestId
        });
    }
}
