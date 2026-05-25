using System.ComponentModel.DataAnnotations;

namespace Facade.ProfessionalManagement.Contracts.Requests.CertificateSkill;

// Запрос на добавление навыка к сертификату
public record CreateCertificateSkillRequest
{
    [Required]
    public Guid SkillId { get; init; }
}
