using System.ComponentModel.DataAnnotations;

namespace Facade.ProfessionalManagement.Contracts.Requests.Skill;

// Запрос на создание навыка в справочнике
public record CreateSkillRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; init; } = default!;

    [MaxLength(500)]
    public string? Description { get; init; }
}
