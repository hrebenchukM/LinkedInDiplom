namespace Content.Contracts.Parameters.Mention;

// Параметры удаления упоминания (AuthorId из JWT)
public record RemoveMentionParameters
{
    public string AuthorId { get; init; } = default!;

    public Guid PostId { get; init; }

    public string MentionedUserId { get; init; } = default!;
}
