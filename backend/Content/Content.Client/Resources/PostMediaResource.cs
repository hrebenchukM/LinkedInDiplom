using Content.Client.Contracts.Resources;
using Content.Contracts.DTOs;
using Content.Contracts.Parameters.PostMedia;
using Content.Contracts.Results;
using Content.Contracts.Services;

namespace Content.Client.Resources;

// Реализация Resource для связей поста и медиа.
// Делегирует вызовы в IPostMediaService.
public class PostMediaResource : IPostMediaResource
{
    private readonly IPostMediaService _postMediaService;

    public PostMediaResource(IPostMediaService postMediaService)
    {
        _postMediaService = postMediaService;
    }

    public Task<PostMediaResult> AttachAsync(AttachMediaToPostParameters parameters)
    {
        return _postMediaService.AttachAsync(parameters);
    }

    public Task<PostMediaResult> DetachAsync(DetachMediaFromPostParameters parameters)
    {
        return _postMediaService.DetachAsync(parameters);
    }

    public Task<IReadOnlyCollection<PostMediaDto>> GetByPostIdAsync(GetPostMediaParameters parameters)
    {
        return _postMediaService.GetByPostIdAsync(parameters);
    }
}
