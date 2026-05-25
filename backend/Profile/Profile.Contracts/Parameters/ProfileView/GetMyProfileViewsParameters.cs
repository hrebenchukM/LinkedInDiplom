namespace Profile.Contracts.Parameters.ProfileView;

// Параметры получения просмотров своего профиля (ProfileOwnerId из JWT)
public record GetMyProfileViewsParameters
{
    public string ProfileOwnerId { get; init; } = default!;
}
