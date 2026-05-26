using Content.Contracts.DTOs;
using Content.Contracts.Parameters.Media;
using Content.Contracts.Results;

namespace Content.Client.Contracts.Resources;

// Resource для работы с медиа Content-модуля.
// Внутренняя точка доступа фасада к медиа.
public interface IMediaResource
{
    Task<MediaResult> CreateAsync(CreateMediaParameters parameters);

    Task<MediaDto?> GetByIdAsync(GetMediaByIdParameters parameters);
}
