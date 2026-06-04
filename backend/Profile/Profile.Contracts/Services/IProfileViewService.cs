using Profile.Contracts.DTOs;
using Profile.Contracts.Parameters.ProfileView;
using Profile.Contracts.Results;

namespace Profile.Contracts.Services;

// Интерфейс сервиса журнала просмотров профиля (append-only)
public interface IProfileViewService
{
    Task<ProfileViewResult> RecordProfileViewAsync(RecordProfileViewParameters parameters);

    Task<IReadOnlyCollection<ProfileViewDto>> GetMyProfileViewsAsync(GetMyProfileViewsParameters parameters);
}
