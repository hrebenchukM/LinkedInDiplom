using System.ComponentModel.DataAnnotations;

namespace Facade.ContentManagement.Contracts.Requests.Comment;

// Запрос на создание комментария (автор из JWT)
public record CreateCommentRequest
{
    [Required]
    public string Content { get; init; } = default!;

    public Guid? ParentCommentId { get; init; }
}
