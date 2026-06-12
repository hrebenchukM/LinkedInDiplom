using Content.Client.Contracts.Resources;
using Content.Contracts.DTOs;
using Content.Contracts.Parameters.Hashtag;
using Content.Contracts.Results;
using Content.Contracts.Services;

namespace Content.Client.Resources;

// Реализация Resource для хэштегов.
// Делегирует вызовы в IHashtagService.
public class HashtagResource : IHashtagResource
{
    private readonly IHashtagService _hashtagService;

    public HashtagResource(IHashtagService hashtagService)
    {
        _hashtagService = hashtagService;
    }

    public Task<HashtagResult> CreateAsync(CreateHashtagParameters parameters)
    {
        return _hashtagService.CreateAsync(parameters);
    }

    public Task<HashtagDto?> GetByIdAsync(GetHashtagByIdParameters parameters)
    {
        return _hashtagService.GetByIdAsync(parameters);
    }

    public Task<HashtagDto?> GetByNameAsync(GetHashtagByNameParameters parameters)
    {
        return _hashtagService.GetByNameAsync(parameters);
    }

    public Task<HashtagsResult> GetHashtagsAsync(
        GetHashtagsParameters parameters,
        CancellationToken cancellationToken = default)
    {
        return _hashtagService.GetHashtagsAsync(parameters, cancellationToken);
    }
}
