using Content.Contracts.DTOs;
using Content.Contracts.Parameters.SavedPost;
using Content.Contracts.Results;

namespace Content.Contracts.Services;

// Интерфейс сервиса сохранённых постов
public interface ISavedPostService
{
    Task<SavedPostResult> SaveAsync(SavePostParameters parameters);

    Task<SavedPostResult> UnsaveAsync(UnsavePostParameters parameters);

    Task<IReadOnlyCollection<SavedPostDto>> GetMySavedPostsAsync(GetMySavedPostsParameters parameters);
}
