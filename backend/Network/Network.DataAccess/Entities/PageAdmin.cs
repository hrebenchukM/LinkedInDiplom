namespace Network.DataAccess.Entities;

// Администратор страницы.
public class PageAdmin
{
    public Guid Id { get; set; }

    public Guid PageId { get; set; }

    // Id администратора из Identity.AspNetUsers.
    public string UserId { get; set; } = default!;

    // admin (валидация в service).
    public string Role { get; set; } = default!;

    public DateTime AssignedAt { get; set; }

    public DateTime? RevokedAt { get; set; }
}
