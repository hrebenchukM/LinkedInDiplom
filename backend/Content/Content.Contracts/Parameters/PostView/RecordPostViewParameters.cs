namespace Content.Contracts.Parameters.PostView;

// Параметры записи просмотра поста (ViewerUserId из JWT; IP/UA/source из facade)
public record RecordPostViewParameters
{
    public string ViewerUserId { get; init; } = default!;

    public Guid PostId { get; init; }

    public string ViewerIp { get; init; } = default!;

    public string? ViewerUserAgent { get; init; }

    public string? Source { get; init; }
}
