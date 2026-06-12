using Profile.Contracts.DTOs;
using Profile.Contracts.Parameters.ProfileView;
using Profile.Contracts.Results;

namespace Profile.Client.Contracts.Resources;

// Resource для работы с журналом просмотров профиля Profile-модуля.
// Это внутренняя точка доступа фасада к Profile-модулю.
public interface IProfileViewResource
{
    Task<ProfileViewResult> RecordProfileViewAsync(RecordProfileViewParameters parameters);

    Task<IReadOnlyCollection<ProfileViewDto>> GetMyProfileViewsAsync(GetMyProfileViewsParameters parameters);
}
