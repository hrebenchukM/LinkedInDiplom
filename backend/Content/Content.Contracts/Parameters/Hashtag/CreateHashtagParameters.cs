namespace Content.Contracts.Parameters.Hashtag;

// Параметры создания хэштега (name будет normalized в service: trim + lower)
public record CreateHashtagParameters
{
    public string Name { get; init; } = default!;
}
