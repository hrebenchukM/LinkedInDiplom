namespace Content.Contracts.Parameters.Repost;

// Параметры получения репостов текущего пользователя (UserId из JWT)
public record GetMyRepostsParameters
{
    public string UserId { get; init; } = default!;
}
