using Content.Client.Contracts.Resources;
using Content.Contracts.DTOs;
using Content.Contracts.Parameters.Mention;
using Content.Contracts.Results;
using Content.Contracts.Services;

namespace Content.Client.Resources;

// Реализация Resource для упоминаний в постах.
// Делегирует вызовы в IMentionService.
public class MentionResource : IMentionResource
{
    private readonly IMentionService _mentionService;

    public MentionResource(IMentionService mentionService)
    {
        _mentionService = mentionService;
    }

    public Task<MentionResult> AddAsync(AddMentionParameters parameters)
    {
        return _mentionService.AddAsync(parameters);
    }

    public Task<MentionResult> RemoveAsync(RemoveMentionParameters parameters)
    {
        return _mentionService.RemoveAsync(parameters);
    }

    public Task<IReadOnlyCollection<MentionDto>> GetByPostIdAsync(GetMentionsByPostParameters parameters)
    {
        return _mentionService.GetByPostIdAsync(parameters);
    }
}
