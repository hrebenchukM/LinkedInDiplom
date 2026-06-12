using Content.Contracts.DTOs;
using Content.Contracts.Parameters.PostHashtag;
using Content.Contracts.Results;

namespace Content.Client.Contracts.Resources;

// Resource для работы со связями поста и хэштегов Content-модуля.
// Внутренняя точка доступа фасада к post_hashtags.
public interface IPostHashtagResource
{
    Task<PostHashtagResult> AttachAsync(AttachHashtagToPostParameters parameters);

    Task<PostHashtagResult> DetachAsync(DetachHashtagFromPostParameters parameters);

    Task<IReadOnlyCollection<PostHashtagDto>> GetByPostIdAsync(GetPostHashtagsParameters parameters);
}
