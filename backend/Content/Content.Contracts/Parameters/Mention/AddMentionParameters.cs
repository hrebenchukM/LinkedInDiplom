namespace Content.Contracts.Parameters.Mention;

// Параметры добавления упоминания (AuthorId из JWT; MentionedUserId из body facade)
public record AddMentionParameters
{
    public string AuthorId { get; init; } = default!;

    public Guid PostId { get; init; }

    public string MentionedUserId { get; init; } = default!;
}
