using Content.Contracts.DTOs;
using Content.Contracts.Parameters.PostView;
using Content.Contracts.Results;

namespace Content.Client.Contracts.Resources;

// Resource для работы с просмотрами постов Content-модуля.
// Внутренняя точка доступа фасада к post_views.
public interface IPostViewResource
{
    Task<PostViewResult> RecordAsync(RecordPostViewParameters parameters);

    Task<IReadOnlyCollection<PostViewDto>> GetByPostIdAsync(GetPostViewsParameters parameters);
}
