namespace Facade.MessagingManagement.Contracts.DTOs;

public record MessageMediaDto
{
    public Guid Id { get; init; }
    public Guid MessageId { get; init; }
    public string MediaUrl { get; init; } = default!;
    public string MediaType { get; init; } = default!;
    public DateTime CreatedAt { get; init; }
}
