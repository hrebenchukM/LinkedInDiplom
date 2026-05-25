namespace Facade.ProfessionalManagement.Contracts.Requests.UserSkill;

// Запрос на частичное обновление навыка пользователя.
// Если поле null — значит его не меняем.
public record PatchUserSkillRequest
{
    public Guid? SkillId { get; init; }

    public string? Level { get; init; }

    public bool? IsMain { get; init; }

    public int? OrderIndex { get; init; }
}
