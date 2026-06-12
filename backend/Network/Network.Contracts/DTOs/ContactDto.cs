namespace Network.Contracts.DTOs;

// DTO запроса на контакт между пользователями
public record ContactDto
{
    public Guid Id { get; init; }

    public string RequesterId { get; init; } = default!;

    public string ReceiverId { get; init; } = default!;

    public string Status { get; init; } = default!;

    public DateTime RequestedAt { get; init; }

    public DateTime? RespondedAt { get; init; }

    public DateTime? StatusChangedAt { get; init; }
}
