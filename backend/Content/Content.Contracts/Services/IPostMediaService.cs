using Content.Contracts.DTOs;
using Content.Contracts.Parameters.PostMedia;
using Content.Contracts.Results;

namespace Content.Contracts.Services;

// Интерфейс сервиса связей поста и медиа
public interface IPostMediaService
{
    Task<PostMediaResult> AttachAsync(AttachMediaToPostParameters parameters);

    Task<PostMediaResult> DetachAsync(DetachMediaFromPostParameters parameters);

    Task<IReadOnlyCollection<PostMediaDto>> GetByPostIdAsync(GetPostMediaParameters parameters);
}
