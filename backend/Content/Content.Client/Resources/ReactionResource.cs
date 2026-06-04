using Content.Client.Contracts.Resources;
using Content.Contracts.DTOs;
using Content.Contracts.Parameters.Reaction;
using Content.Contracts.Results;
using Content.Contracts.Services;

namespace Content.Client.Resources;

// Реализация Resource для реакций.
// Делегирует вызовы в IReactionService.
public class ReactionResource : IReactionResource
{
    private readonly IReactionService _reactionService;

    public ReactionResource(IReactionService reactionService)
    {
        _reactionService = reactionService;
    }

    public Task<ReactionResult> UpsertAsync(UpsertReactionParameters parameters)
    {
        return _reactionService.UpsertAsync(parameters);
    }

    public Task<ReactionResult> DeleteAsync(DeleteReactionParameters parameters)
    {
        return _reactionService.DeleteAsync(parameters);
    }

    public Task<ReactionDto?> GetMyByPostIdAsync(GetMyReactionParameters parameters)
    {
        return _reactionService.GetMyByPostIdAsync(parameters);
    }

    public Task<IReadOnlyCollection<ReactionDto>> GetByPostIdAsync(GetReactionsByPostParameters parameters)
    {
        return _reactionService.GetByPostIdAsync(parameters);
    }
}
