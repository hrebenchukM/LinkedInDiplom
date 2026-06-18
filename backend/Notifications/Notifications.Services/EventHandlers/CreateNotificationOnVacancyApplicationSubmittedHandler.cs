using Identity.Events.Contracts.Abstractions;
using Jobs.Events.Contracts.Events;
using Notifications.Contracts.Parameters.Notification;
using Notifications.Contracts.Services;

namespace Notifications.Services.EventHandlers;

public class CreateNotificationOnVacancyApplicationSubmittedHandler
    : IDomainEventHandler<VacancyApplicationSubmittedEvent>
{
    private readonly INotificationService _notificationService;

    public CreateNotificationOnVacancyApplicationSubmittedHandler(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    public async Task HandleAsync(
        VacancyApplicationSubmittedEvent domainEvent,
        CancellationToken cancellationToken = default)
    {
        if (domainEvent.ApplicantUserId == domainEvent.PostedByUserId)
        {
            return;
        }

        await _notificationService.CreateAsync(new CreateNotificationParameters
        {
            UserId = domainEvent.PostedByUserId,
            ActorUserId = domainEvent.ApplicantUserId,
            Type = "job_application",
            Title = "New job application",
            Body = "Someone applied to your vacancy.",
            EntityType = "vacancy",
            EntityId = domainEvent.VacancyId
        });
    }
}
