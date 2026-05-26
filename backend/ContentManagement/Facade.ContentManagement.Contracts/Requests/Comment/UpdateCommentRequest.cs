using System.ComponentModel.DataAnnotations;

namespace Facade.ContentManagement.Contracts.Requests.Comment;

// Запрос на обновление комментария (автор из JWT)
public record UpdateCommentRequest
{
    [Required]
    public string Content { get; init; } = default!;
}
