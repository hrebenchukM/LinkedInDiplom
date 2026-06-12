namespace Profile.Contracts.DTOs;

// DTO настроек сообщений пользователя
public record MessageSettingsDto
{
    public Guid Id { get; init; }

    public string UserId { get; init; } = default!;

    public bool OfficeAbsenceEnabled { get; init; }

    public string? OfficeAbsenceMessage { get; init; }

    public bool NotificationsEnabled { get; init; }

    public DateTime CreatedAt { get; init; }

    public DateTime? UpdatedAt { get; init; }
}
