using Identity.Events.Contracts.Abstractions;
using Network.Events.Contracts.Events;
using Notifications.Contracts.Parameters.Notification;
using Notifications.Contracts.Services;

namespace Notifications.Services.EventHandlers;

public class CreateNotificationOnContactRequestAcceptedHandler
    : IDomainEventHandler<ContactRequestAcceptedEvent>
{
    private readonly INotificationService _notificationService;

    public CreateNotificationOnContactRequestAcceptedHandler(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    public async Task HandleAsync(
        ContactRequestAcceptedEvent domainEvent,
        CancellationToken cancellationToken = default)
    {
        if (domainEvent.RequesterUserId == domainEvent.AccepterUserId)
        {
            return;
        }

        await _notificationService.CreateAsync(new CreateNotificationParameters
        {
            UserId = domainEvent.RequesterUserId,
            ActorUserId = domainEvent.AccepterUserId,
            Type = "contact_request_accepted",
            Title = "Contact request accepted",
            Body = "Your contact request was accepted.",
            EntityType = "contact_request",
            EntityId = domainEvent.ContactRequestId
        });
    }
}
