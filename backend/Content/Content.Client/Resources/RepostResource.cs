using Content.Client.Contracts.Resources;
using Content.Contracts.DTOs;
using Content.Contracts.Parameters.Repost;
using Content.Contracts.Results;
using Content.Contracts.Services;

namespace Content.Client.Resources;

// Реализация Resource для репостов.
// Делегирует вызовы в IRepostService.
public class RepostResource : IRepostResource
{
    private readonly IRepostService _repostService;

    public RepostResource(IRepostService repostService)
    {
        _repostService = repostService;
    }

    public Task<RepostResult> RepostAsync(RepostPostParameters parameters)
    {
        return _repostService.RepostAsync(parameters);
    }

    public Task<RepostResult> UnrepostAsync(UnrepostPostParameters parameters)
    {
        return _repostService.UnrepostAsync(parameters);
    }

    public Task<IReadOnlyCollection<RepostDto>> GetMyRepostsAsync(GetMyRepostsParameters parameters)
    {
        return _repostService.GetMyRepostsAsync(parameters);
    }

    public Task<IReadOnlyCollection<RepostDto>> GetByPostIdAsync(GetRepostsByPostParameters parameters)
    {
        return _repostService.GetByPostIdAsync(parameters);
    }
}
