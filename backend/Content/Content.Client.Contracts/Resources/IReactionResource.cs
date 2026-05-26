using Content.Contracts.DTOs;
using Content.Contracts.Parameters.Reaction;
using Content.Contracts.Results;

namespace Content.Client.Contracts.Resources;

// Resource для работы с реакциями Content-модуля.
// Внутренняя точка доступа фасада к реакциям.
public interface IReactionResource
{
    Task<ReactionResult> UpsertAsync(UpsertReactionParameters parameters);

    Task<ReactionResult> DeleteAsync(DeleteReactionParameters parameters);

    Task<ReactionDto?> GetMyByPostIdAsync(GetMyReactionParameters parameters);

    Task<IReadOnlyCollection<ReactionDto>> GetByPostIdAsync(GetReactionsByPostParameters parameters);
}
