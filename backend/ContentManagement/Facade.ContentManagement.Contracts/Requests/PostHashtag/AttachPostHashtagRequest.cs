using System.ComponentModel.DataAnnotations;

namespace Facade.ContentManagement.Contracts.Requests.PostHashtag;

// Запрос на привязку хэштега к посту (автор из JWT)
public record AttachPostHashtagRequest
{
    [Required]
    public Guid HashtagId { get; init; }
}
