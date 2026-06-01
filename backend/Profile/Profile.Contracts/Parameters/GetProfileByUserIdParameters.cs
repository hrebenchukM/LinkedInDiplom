namespace Profile.Contracts.Parameters;

// Данные для поиска профиля по UserId
public record GetProfileByUserIdParameters
{
    // Id пользователя из Identity
    public string UserId { get; init; } = default!;
}