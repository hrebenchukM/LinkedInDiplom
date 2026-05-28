using Content.Contracts.Parameters.Media;
using Content.Contracts.Parameters.PostMedia;
using Facade.ContentManagement.Contracts.DTOs;
using Facade.ContentManagement.Contracts.Requests.Media;
using Facade.ContentManagement.Contracts.Requests.PostMedia;
using Facade.ContentManagement.Contracts.Responses;

namespace Facade.ContentManagement.Services.Services;

public partial class ContentManagementService
{
    public async Task<MediaResponse> CreateMediaAsync(CreateMediaRequest request)
    {
        var result = await _contentClient.Media.CreateAsync(new CreateMediaParameters
        {
            Url = request.Url,
            Type = request.Type
        });

        return MapMediaResult(result);
    }

    public async Task<MediaDto?> GetMediaByIdAsync(Guid mediaId)
    {
        var media = await _contentClient.Media.GetByIdAsync(new GetMediaByIdParameters
        {
            MediaId = mediaId
        });

        return media == null ? null : MapMediaToFacadeDto(media);
    }

    public async Task<PostMediaResponse> AttachPostMediaAsync(
        string userId,
        Guid postId,
        AttachPostMediaRequest request)
    {
        var result = await _contentClient.PostMedia.AttachAsync(new AttachMediaToPostParameters
        {
            AuthorId = userId,
            PostId = postId,
            MediaId = request.MediaId
        });

        return MapPostMediaResult(result);
    }

    public async Task<PostMediaResponse> DetachPostMediaAsync(string userId, Guid postId, Guid mediaId)
    {
        var result = await _contentClient.PostMedia.DetachAsync(new DetachMediaFromPostParameters
        {
            AuthorId = userId,
            PostId = postId,
            MediaId = mediaId
        });

        return MapPostMediaResult(result);
    }

    public async Task<IReadOnlyCollection<PostMediaDto>> GetPostMediaAsync(string userId, Guid postId)
    {
        var links = await _contentClient.PostMedia.GetByPostIdAsync(new GetPostMediaParameters
        {
            ViewerUserId = userId,
            PostId = postId
        });

        return links.Select(MapPostMediaToFacadeDto).ToList();
    }
}
