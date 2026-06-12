using Content.Contracts.DTOs;
using Content.Contracts.Parameters.Reaction;
using Content.Contracts.Results;

namespace Content.Contracts.Services;

// Интерфейс сервиса реакций
public interface IReactionService
{
    Task<ReactionResult> UpsertAsync(UpsertReactionParameters parameters);

    Task<ReactionResult> DeleteAsync(DeleteReactionParameters parameters);

    Task<ReactionDto?> GetMyByPostIdAsync(GetMyReactionParameters parameters);

    Task<IReadOnlyCollection<ReactionDto>> GetByPostIdAsync(GetReactionsByPostParameters parameters);
}
