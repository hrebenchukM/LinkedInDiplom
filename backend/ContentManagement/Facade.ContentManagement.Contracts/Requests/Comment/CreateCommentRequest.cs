using System.ComponentModel.DataAnnotations;

namespace Facade.ContentManagement.Contracts.Requests.Comment;

// Запрос на создание комментария (автор из JWT)
public record CreateCommentRequest
{
    [Required]
    [StringLength(4000, MinimumLength = 1)]
    public string Content { get; init; } = default!;

    public Guid? ParentCommentId { get; init; }
}
