using System.ComponentModel.DataAnnotations;

namespace Facade.ContentManagement.Contracts.Requests.PostMedia;

// Запрос на привязку медиа к посту
public record AttachPostMediaRequest
{
    [Required]
    public Guid MediaId { get; init; }
}
