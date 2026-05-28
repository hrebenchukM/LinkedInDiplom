using System.ComponentModel.DataAnnotations;

namespace Facade.ContentManagement.Contracts.Requests.Post;

// Запрос на создание поста (автор из JWT)
public record CreatePostRequest
{
    [Required]
    [StringLength(4000, MinimumLength = 1)]
    public string Content { get; init; } = default!;

    [StringLength(50)]
    public string? Visibility { get; init; }

    public IReadOnlyCollection<Guid>? MediaIds { get; init; }
}
