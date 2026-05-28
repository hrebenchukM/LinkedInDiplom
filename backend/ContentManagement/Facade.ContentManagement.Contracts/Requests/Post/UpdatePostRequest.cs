using System.ComponentModel.DataAnnotations;

namespace Facade.ContentManagement.Contracts.Requests.Post;

// Запрос на обновление поста (автор из JWT)
public record UpdatePostRequest
{
    [Required]
    [StringLength(4000, MinimumLength = 1)]
    public string Content { get; init; } = default!;

    [Required]
    [StringLength(50, MinimumLength = 1)]
    public string Visibility { get; init; } = default!;
}
