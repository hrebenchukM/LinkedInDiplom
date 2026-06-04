using Content.Contracts.DTOs;
using Content.Contracts.Parameters.SavedPost;
using Content.Contracts.Results;

namespace Content.Client.Contracts.Resources;

// Resource для работы с сохранёнными постами Content-модуля.
// Внутренняя точка доступа фасада к saved_posts.
public interface ISavedPostResource
{
    Task<SavedPostResult> SaveAsync(SavePostParameters parameters);

    Task<SavedPostResult> UnsaveAsync(UnsavePostParameters parameters);

    Task<IReadOnlyCollection<SavedPostDto>> GetMySavedPostsAsync(GetMySavedPostsParameters parameters);
}
