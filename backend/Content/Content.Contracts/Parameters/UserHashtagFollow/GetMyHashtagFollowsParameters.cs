namespace Content.Contracts.Parameters.UserHashtagFollow;

// Параметры получения моих подписок на хэштеги (UserId из JWT)
public record GetMyHashtagFollowsParameters
{
    public string UserId { get; init; } = default!;
}
