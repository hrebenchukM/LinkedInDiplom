using Facade.ContentManagement.Contracts.DTOs;
using Facade.ContentManagement.Contracts.Requests.Media;
using Facade.ContentManagement.Contracts.Requests.Post;
using Facade.ContentManagement.Contracts.Requests.PostMedia;
using Facade.ContentManagement.Contracts.Responses;

namespace Facade.ContentManagement.Contracts.Services;

// Фасадный сервис для Content-модуля
public interface IContentManagementService
{
    Task<MediaResponse> CreateMediaAsync(CreateMediaRequest request);

    Task<MediaDto?> GetMediaByIdAsync(Guid mediaId);

    Task<PostResponse> CreatePostAsync(string userId, CreatePostRequest request);

    Task<IReadOnlyCollection<PostDto>> GetMyPostsAsync(string userId);

    Task<PostDto?> GetPostByIdAsync(string userId, Guid postId);

    Task<PostResponse> UpdatePostAsync(string userId, Guid postId, UpdatePostRequest request);

    Task<PostResponse> DeletePostAsync(string userId, Guid postId);

    Task<PostMediaResponse> AttachPostMediaAsync(
        string userId,
        Guid postId,
        AttachPostMediaRequest request);

    Task<PostMediaResponse> DetachPostMediaAsync(string userId, Guid postId, Guid mediaId);

    Task<IReadOnlyCollection<PostMediaDto>> GetPostMediaAsync(string userId, Guid postId);
}
