using Content.Contracts.DTOs;
using Content.Contracts.Parameters.Mention;
using Content.Contracts.Results;

namespace Content.Contracts.Services;

// Интерфейс сервиса упоминаний в постах
public interface IMentionService
{
    Task<MentionResult> AddAsync(AddMentionParameters parameters);

    Task<MentionResult> RemoveAsync(RemoveMentionParameters parameters);

    Task<IReadOnlyCollection<MentionDto>> GetByPostIdAsync(GetMentionsByPostParameters parameters);
}
