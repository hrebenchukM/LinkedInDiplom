using Content.Client.Contracts.Resources;
using Content.Contracts.DTOs;
using Content.Contracts.Parameters.PostView;
using Content.Contracts.Results;
using Content.Contracts.Services;

namespace Content.Client.Resources;

// Реализация Resource для просмотров постов.
// Делегирует вызовы в IPostViewService.
public class PostViewResource : IPostViewResource
{
    private readonly IPostViewService _postViewService;

    public PostViewResource(IPostViewService postViewService)
    {
        _postViewService = postViewService;
    }

    public Task<PostViewResult> RecordAsync(RecordPostViewParameters parameters)
    {
        return _postViewService.RecordAsync(parameters);
    }

    public Task<IReadOnlyCollection<PostViewDto>> GetByPostIdAsync(GetPostViewsParameters parameters)
    {
        return _postViewService.GetByPostIdAsync(parameters);
    }
}
