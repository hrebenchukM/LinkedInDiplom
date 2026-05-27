namespace Facade.MessagingManagement.Contracts.Requests.MessageMedia;

public record AttachMessageMediaRequest
{
    public string MediaUrl { get; init; } = default!;
    public string MediaType { get; init; } = default!;
}
