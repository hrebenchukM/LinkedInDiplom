using System.ComponentModel.DataAnnotations;

namespace Facade.ProfessionalManagement.Contracts.Requests.UserSkill;

// Запрос на добавление навыка текущему пользователю
public record CreateUserSkillRequest
{
    [Required]
    public Guid SkillId { get; init; }

    [MaxLength(100)]
    public string? Level { get; init; }

    public bool IsMain { get; init; }

    public int OrderIndex { get; init; }
}
