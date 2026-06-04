using Content.Contracts.DTOs;
using Content.Contracts.Parameters.Media;
using Content.Contracts.Results;

namespace Content.Contracts.Services;

// Интерфейс сервиса медиа
public interface IMediaService
{
    Task<MediaResult> CreateAsync(CreateMediaParameters parameters);

    Task<MediaDto?> GetByIdAsync(GetMediaByIdParameters parameters);
}
