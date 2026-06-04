using Content.Contracts.Parameters.Mention;
using Facade.ContentManagement.Contracts.DTOs;
using Facade.ContentManagement.Contracts.Requests.Mention;
using Facade.ContentManagement.Contracts.Responses;

namespace Facade.ContentManagement.Services.Services;

public partial class ContentManagementService
{
    public async Task<MentionResponse> AddMentionAsync(string userId, Guid postId, AddMentionRequest request)
    {
        var result = await _contentClient.Mentions.AddAsync(new AddMentionParameters
        {
            AuthorId = userId,
            PostId = postId,
            MentionedUserId = request.MentionedUserId
        });

        return MapMentionResult(result);
    }

    public async Task<MentionResponse> RemoveMentionAsync(string userId, Guid postId, string mentionedUserId)
    {
        var result = await _contentClient.Mentions.RemoveAsync(new RemoveMentionParameters
        {
            AuthorId = userId,
            PostId = postId,
            MentionedUserId = mentionedUserId
        });

        return MapMentionResult(result);
    }

    public async Task<IReadOnlyCollection<MentionDto>> GetMentionsByPostIdAsync(string userId, Guid postId)
    {
        var mentions = await _contentClient.Mentions.GetByPostIdAsync(new GetMentionsByPostParameters
        {
            ViewerUserId = userId,
            PostId = postId
        });

        return mentions.Select(MapMentionToFacadeDto).ToList();
    }
}
