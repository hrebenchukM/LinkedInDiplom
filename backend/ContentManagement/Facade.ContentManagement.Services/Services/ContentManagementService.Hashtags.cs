using Content.Contracts.Parameters.Hashtag;
using Content.Contracts.Parameters.PostHashtag;
using Facade.ContentManagement.Contracts.DTOs;
using Facade.ContentManagement.Contracts.Requests.Hashtag;
using Facade.ContentManagement.Contracts.Requests.PostHashtag;
using Facade.ContentManagement.Contracts.Responses;

namespace Facade.ContentManagement.Services.Services;

public partial class ContentManagementService
{
    public async Task<HashtagResponse> CreateHashtagAsync(CreateHashtagRequest request)
    {
        var result = await _contentClient.Hashtags.CreateAsync(new CreateHashtagParameters
        {
            Name = request.Name
        });

        return MapHashtagResult(result);
    }

    public async Task<HashtagDto?> GetHashtagByIdAsync(Guid hashtagId)
    {
        var hashtag = await _contentClient.Hashtags.GetByIdAsync(new GetHashtagByIdParameters
        {
            HashtagId = hashtagId
        });

        return hashtag == null ? null : MapHashtagToFacadeDto(hashtag);
    }

    public async Task<PostHashtagResponse> AttachPostHashtagAsync(
        string userId,
        Guid postId,
        AttachPostHashtagRequest request)
    {
        var result = await _contentClient.PostHashtags.AttachAsync(new AttachHashtagToPostParameters
        {
            AuthorId = userId,
            PostId = postId,
            HashtagId = request.HashtagId
        });

        return MapPostHashtagResult(result);
    }

    public async Task<PostHashtagResponse> DetachPostHashtagAsync(string userId, Guid postId, Guid hashtagId)
    {
        var result = await _contentClient.PostHashtags.DetachAsync(new DetachHashtagFromPostParameters
        {
            AuthorId = userId,
            PostId = postId,
            HashtagId = hashtagId
        });

        return MapPostHashtagResult(result);
    }

    public async Task<IReadOnlyCollection<PostHashtagDto>> GetPostHashtagsAsync(string userId, Guid postId)
    {
        var links = await _contentClient.PostHashtags.GetByPostIdAsync(new GetPostHashtagsParameters
        {
            ViewerUserId = userId,
            PostId = postId
        });

        return links.Select(MapPostHashtagToFacadeDto).ToList();
    }
}
