namespace Facade.MessagingManagement.Contracts.Requests.Chat;

// Current chat creation only initializes a chat for the authenticated user.
// Additional members are added through the chat membership flow.
public record CreateChatRequest;
