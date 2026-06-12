namespace Content.Contracts.Parameters.Hashtag;

// Параметры получения хэштега по имени
public record GetHashtagByNameParameters
{
    public string Name { get; init; } = default!;
}
