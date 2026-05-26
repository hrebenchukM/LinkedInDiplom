using Content.Client.Contracts.Resources;
using Content.Contracts.DTOs;
using Content.Contracts.Parameters.Media;
using Content.Contracts.Results;
using Content.Contracts.Services;

namespace Content.Client.Resources;

// Реализация Resource для медиа.
// Делегирует вызовы в IMediaService.
public class MediaResource : IMediaResource
{
    private readonly IMediaService _mediaService;

    public MediaResource(IMediaService mediaService)
    {
        _mediaService = mediaService;
    }

    public Task<MediaResult> CreateAsync(CreateMediaParameters parameters)
    {
        return _mediaService.CreateAsync(parameters);
    }

    public Task<MediaDto?> GetByIdAsync(GetMediaByIdParameters parameters)
    {
        return _mediaService.GetByIdAsync(parameters);
    }
}
