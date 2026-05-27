using Content.Contracts.DTOs;
using Content.Contracts.Parameters.PostView;
using Content.Contracts.Results;

namespace Content.Contracts.Services;

// Интерфейс сервиса просмотров постов
public interface IPostViewService
{
    Task<PostViewResult> RecordAsync(RecordPostViewParameters parameters);

    Task<IReadOnlyCollection<PostViewDto>> GetByPostIdAsync(GetPostViewsParameters parameters);
}
