namespace Content.Contracts.Parameters.Mention;

// Параметры получения упоминаний поста (ViewerUserId из JWT — проверка доступа)
public record GetMentionsByPostParameters
{
    public string ViewerUserId { get; init; } = default!;

    public Guid PostId { get; init; }
}
