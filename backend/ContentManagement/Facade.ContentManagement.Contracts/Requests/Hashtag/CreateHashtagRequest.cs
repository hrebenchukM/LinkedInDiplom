using System.ComponentModel.DataAnnotations;

namespace Facade.ContentManagement.Contracts.Requests.Hashtag;

// Запрос на создание хэштега (name normalized в Content service)
public record CreateHashtagRequest
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; init; } = default!;
}
