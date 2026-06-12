namespace Content.Contracts.Parameters.SavedPost;

// Параметры получения сохранённых постов текущего пользователя (UserId из JWT)
public record GetMySavedPostsParameters
{
    public string UserId { get; init; } = default!;
}
