using System.ComponentModel.DataAnnotations;

namespace Facade.ContentManagement.Contracts.Requests.Hashtag;

// Запрос на создание хэштега (name normalized в Content service)
public record CreateHashtagRequest
{
    [Required]
    public string Name { get; init; } = default!;
}
