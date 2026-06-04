using Content.Contracts.DTOs;
using Content.Contracts.Parameters.Post;
using Content.Contracts.Results;

namespace Content.Contracts.Services;

// Интерфейс сервиса постов
public interface IPostService
{
    Task<PostResult> CreateAsync(CreatePostParameters parameters);

    Task<IReadOnlyCollection<PostDto>> GetMyPostsAsync(GetMyPostsParameters parameters);

    Task<PostDto?> GetByIdAsync(GetPostByIdParameters parameters);

    Task<PostResult> UpdateAsync(UpdatePostParameters parameters);

    Task<PostResult> DeleteAsync(DeletePostParameters parameters);
}
