namespace Content.Contracts.Parameters.Hashtag;

// Параметры получения хэштега по Id
public record GetHashtagByIdParameters
{
    public Guid HashtagId { get; init; }
}
