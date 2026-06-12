namespace Network.DataAccess.Entities;

// Запрос на контакт между пользователями (requester → receiver).
public class Contact
{
    public Guid Id { get; set; }

    // Id инициатора из Identity.AspNetUsers.
    public string RequesterId { get; set; } = default!;

    // Id получателя из Identity.AspNetUsers.
    public string ReceiverId { get; set; } = default!;

    // pending, accepted, rejected, cancelled (валидация в service).
    public string Status { get; set; } = default!;

    public DateTime RequestedAt { get; set; }

    public DateTime? RespondedAt { get; set; }

    public DateTime? StatusChangedAt { get; set; }
}
