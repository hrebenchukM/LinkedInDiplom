namespace Network.DataAccess.Entities;

// Группа пользователей.
public class UserGroup
{
    public Guid Id { get; set; }

    // Id владельца из Identity.AspNetUsers.
    public string OwnerId { get; set; } = default!;

    public string Name { get; set; } = default!;

    public string? Description { get; set; }

    public string? AvatarUrl { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }
}
