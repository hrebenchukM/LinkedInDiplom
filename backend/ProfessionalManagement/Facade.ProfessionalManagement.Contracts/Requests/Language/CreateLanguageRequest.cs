using System.ComponentModel.DataAnnotations;

namespace Facade.ProfessionalManagement.Contracts.Requests.Language;

// Запрос на создание языка в справочнике
public record CreateLanguageRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; init; } = default!;
}
