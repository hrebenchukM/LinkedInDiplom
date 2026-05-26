using Content.Contracts.DTOs;
using Content.Contracts.Parameters.Post;
using Content.Contracts.Results;

namespace Content.Client.Contracts.Resources;

// Resource для работы с постами Content-модуля.
// Внутренняя точка доступа фасада к постам.
public interface IPostResource
{
    Task<PostResult> CreateAsync(CreatePostParameters parameters);

    Task<IReadOnlyCollection<PostDto>> GetMyPostsAsync(GetMyPostsParameters parameters);

    Task<PostDto?> GetByIdAsync(GetPostByIdParameters parameters);

    Task<PostResult> UpdateAsync(UpdatePostParameters parameters);

    Task<PostResult> DeleteAsync(DeletePostParameters parameters);
}
