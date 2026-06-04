namespace Messaging.Contracts.Parameters.MessageMedia;

public record AttachMessageMediaParameters
{
    public string UserId { get; init; } = default!;
    public Guid MessageId { get; init; }
    public string MediaUrl { get; init; } = default!;
    public string MediaType { get; init; } = default!;
}
