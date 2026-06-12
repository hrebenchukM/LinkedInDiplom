using System.ComponentModel.DataAnnotations;

namespace Facade.ContentManagement.Contracts.Requests.Comment;

// Запрос на обновление комментария (автор из JWT)
public record UpdateCommentRequest
{
    [Required]
    [StringLength(4000, MinimumLength = 1)]
    public string Content { get; init; } = default!;
}
