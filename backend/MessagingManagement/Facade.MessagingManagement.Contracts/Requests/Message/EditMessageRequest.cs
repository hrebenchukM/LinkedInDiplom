namespace Facade.MessagingManagement.Contracts.Requests.Message;

public record EditMessageRequest
{
    public string Content { get; init; } = default!;
}
