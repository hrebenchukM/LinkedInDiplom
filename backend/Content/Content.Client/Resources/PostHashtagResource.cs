using Content.Client.Contracts.Resources;
using Content.Contracts.DTOs;
using Content.Contracts.Parameters.PostHashtag;
using Content.Contracts.Results;
using Content.Contracts.Services;

namespace Content.Client.Resources;

// Реализация Resource для связей поста и хэштегов.
// Делегирует вызовы в IPostHashtagService.
public class PostHashtagResource : IPostHashtagResource
{
    private readonly IPostHashtagService _postHashtagService;

    public PostHashtagResource(IPostHashtagService postHashtagService)
    {
        _postHashtagService = postHashtagService;
    }

    public Task<PostHashtagResult> AttachAsync(AttachHashtagToPostParameters parameters)
    {
        return _postHashtagService.AttachAsync(parameters);
    }

    public Task<PostHashtagResult> DetachAsync(DetachHashtagFromPostParameters parameters)
    {
        return _postHashtagService.DetachAsync(parameters);
    }

    public Task<IReadOnlyCollection<PostHashtagDto>> GetByPostIdAsync(GetPostHashtagsParameters parameters)
    {
        return _postHashtagService.GetByPostIdAsync(parameters);
    }
}
