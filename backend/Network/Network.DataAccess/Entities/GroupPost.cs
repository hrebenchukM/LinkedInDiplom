namespace Network.DataAccess.Entities;

// Связь группы и поста.
public class GroupPost
{
    public Guid Id { get; set; }

    public Guid GroupId { get; set; }

    public Guid PostId { get; set; }

    public DateTime CreatedAt { get; set; }
}
