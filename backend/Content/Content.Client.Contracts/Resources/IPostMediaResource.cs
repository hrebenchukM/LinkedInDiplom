using Content.Contracts.DTOs;
using Content.Contracts.Parameters.PostMedia;
using Content.Contracts.Results;

namespace Content.Client.Contracts.Resources;

// Resource для работы со связями поста и медиа Content-модуля.
// Внутренняя точка доступа фасада к post_media.
public interface IPostMediaResource
{
    Task<PostMediaResult> AttachAsync(AttachMediaToPostParameters parameters);

    Task<PostMediaResult> DetachAsync(DetachMediaFromPostParameters parameters);

    Task<IReadOnlyCollection<PostMediaDto>> GetByPostIdAsync(GetPostMediaParameters parameters);
}
