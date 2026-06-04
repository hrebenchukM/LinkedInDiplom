namespace Network.DataAccess.Entities;

// Участник группы.
public class GroupMember
{
    public Guid Id { get; set; }

    public Guid GroupId { get; set; }

    // Id участника из Identity.AspNetUsers.
    public string UserId { get; set; } = default!;

    // owner, member (валидация в service).
    public string Role { get; set; } = default!;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }
}
