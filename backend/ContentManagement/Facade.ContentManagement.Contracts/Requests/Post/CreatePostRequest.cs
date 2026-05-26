using System.ComponentModel.DataAnnotations;

namespace Facade.ContentManagement.Contracts.Requests.Post;

// Запрос на создание поста (автор из JWT)
public record CreatePostRequest
{
    [Required]
    public string Content { get; init; } = default!;

    public string? Visibility { get; init; }

    public IReadOnlyCollection<Guid>? MediaIds { get; init; }
}
