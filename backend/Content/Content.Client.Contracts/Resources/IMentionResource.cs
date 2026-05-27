using Content.Contracts.DTOs;
using Content.Contracts.Parameters.Mention;
using Content.Contracts.Results;

namespace Content.Client.Contracts.Resources;

// Resource для работы с упоминаниями в постах Content-модуля.
// Внутренняя точка доступа фасада к mentions.
public interface IMentionResource
{
    Task<MentionResult> AddAsync(AddMentionParameters parameters);

    Task<MentionResult> RemoveAsync(RemoveMentionParameters parameters);

    Task<IReadOnlyCollection<MentionDto>> GetByPostIdAsync(GetMentionsByPostParameters parameters);
}
