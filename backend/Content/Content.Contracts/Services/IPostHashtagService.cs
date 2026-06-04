using Content.Contracts.DTOs;
using Content.Contracts.Parameters.PostHashtag;
using Content.Contracts.Results;

namespace Content.Contracts.Services;

// Интерфейс сервиса связей поста и хэштегов
public interface IPostHashtagService
{
    Task<PostHashtagResult> AttachAsync(AttachHashtagToPostParameters parameters);

    Task<PostHashtagResult> DetachAsync(DetachHashtagFromPostParameters parameters);

    Task<IReadOnlyCollection<PostHashtagDto>> GetByPostIdAsync(GetPostHashtagsParameters parameters);
}
