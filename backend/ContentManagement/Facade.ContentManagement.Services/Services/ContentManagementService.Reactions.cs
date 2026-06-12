using Content.Contracts.Parameters.Reaction;
using Facade.ContentManagement.Contracts.DTOs;
using Facade.ContentManagement.Contracts.Requests.Reaction;
using Facade.ContentManagement.Contracts.Responses;

namespace Facade.ContentManagement.Services.Services;

public partial class ContentManagementService
{
    public async Task<ReactionResponse> UpsertReactionAsync(string userId, Guid postId, UpsertReactionRequest request)
    {
        var result = await _contentClient.Reactions.UpsertAsync(new UpsertReactionParameters
        {
            UserId = userId,
            PostId = postId,
            ReactionType = request.ReactionType
        });

        return MapReactionResult(result);
    }

    public async Task<ReactionResponse> DeleteReactionAsync(string userId, Guid postId)
    {
        var result = await _contentClient.Reactions.DeleteAsync(new DeleteReactionParameters
        {
            UserId = userId,
            PostId = postId
        });

        return MapReactionResult(result);
    }

    public async Task<ReactionDto?> GetMyReactionByPostIdAsync(string userId, Guid postId)
    {
        var reaction = await _contentClient.Reactions.GetMyByPostIdAsync(new GetMyReactionParameters
        {
            UserId = userId,
            PostId = postId
        });

        return reaction == null ? null : MapReactionToFacadeDto(reaction);
    }

    public async Task<IReadOnlyCollection<ReactionDto>> GetReactionsByPostIdAsync(string userId, Guid postId)
    {
        var reactions = await _contentClient.Reactions.GetByPostIdAsync(new GetReactionsByPostParameters
        {
            ViewerUserId = userId,
            PostId = postId
        });

        return reactions.Select(MapReactionToFacadeDto).ToList();
    }
}
