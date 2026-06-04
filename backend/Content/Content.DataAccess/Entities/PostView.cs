namespace Content.DataAccess.Entities;

// Просмотр поста (журнал событий).
public class PostView
{
    public Guid Id { get; set; }

    public Guid PostId { get; set; }

    // Id зрителя из Identity.AspNetUsers; null для анонимного просмотра.
    public string? ViewerUserId { get; set; }

    public string ViewerIp { get; set; } = default!;

    public string? ViewerUserAgent { get; set; }

    public string? Source { get; set; }

    public DateTime ViewedAt { get; set; }
}
