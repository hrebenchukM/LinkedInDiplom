using Identity.Events.Contracts.Abstractions;
using Identity.Events.Contracts.Events;
using Profile.Contracts.Services;

namespace Profile.Services.EventHandlers;

// Когда пользователь зарегистрировался,
// Profile-модуль автоматически создаёт для него пустой профиль.
public class CreateEmptyProfileWhenUserRegisteredHandler
    : IDomainEventHandler<UserRegisteredEvent>
{
    private readonly IProfileService _profileService;

    public CreateEmptyProfileWhenUserRegisteredHandler(IProfileService profileService)
    {
        _profileService = profileService;
    }

    public async Task HandleAsync(
        UserRegisteredEvent domainEvent,
        CancellationToken cancellationToken = default)
    {
        await _profileService.CreateEmptyAsync(domainEvent.UserId);
    }
}