using Content.Client.Contracts.Resources;
using Content.Contracts.DTOs;
using Content.Contracts.Parameters.SavedPost;
using Content.Contracts.Results;
using Content.Contracts.Services;

namespace Content.Client.Resources;

// Реализация Resource для сохранённых постов.
// Делегирует вызовы в ISavedPostService.
public class SavedPostResource : ISavedPostResource
{
    private readonly ISavedPostService _savedPostService;

    public SavedPostResource(ISavedPostService savedPostService)
    {
        _savedPostService = savedPostService;
    }

    public Task<SavedPostResult> SaveAsync(SavePostParameters parameters)
    {
        return _savedPostService.SaveAsync(parameters);
    }

    public Task<SavedPostResult> UnsaveAsync(UnsavePostParameters parameters)
    {
        return _savedPostService.UnsaveAsync(parameters);
    }

    public Task<IReadOnlyCollection<SavedPostDto>> GetMySavedPostsAsync(GetMySavedPostsParameters parameters)
    {
        return _savedPostService.GetMySavedPostsAsync(parameters);
    }
}
