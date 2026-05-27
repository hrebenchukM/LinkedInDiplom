namespace Facade.MessagingManagement.Contracts.Requests.Message;

public record SendMessageRequest
{
    public string Content { get; init; } = default!;
}
