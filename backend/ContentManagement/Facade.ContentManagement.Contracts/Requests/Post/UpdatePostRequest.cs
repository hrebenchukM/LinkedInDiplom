using System.ComponentModel.DataAnnotations;

namespace Facade.ContentManagement.Contracts.Requests.Post;

// Запрос на обновление поста (автор из JWT)
public record UpdatePostRequest
{
    [Required]
    public string Content { get; init; } = default!;

    [Required]
    public string Visibility { get; init; } = default!;
}
