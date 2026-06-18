namespace Facade.MessagingManagement.Contracts.Requests.Chat;

// Creates a chat for the authenticated user. When ParticipantUserId is set,
// the facade also adds that user as a member (direct messaging).
public class CreateChatRequest
{
    public string? ParticipantUserId { get; set; }
}
