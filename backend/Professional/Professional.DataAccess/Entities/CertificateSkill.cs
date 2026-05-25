namespace Professional.DataAccess.Entities;

// Связка сертификата с навыком из справочника skills.
// Владелец определяется через Certificate.UserId, без UserId в этой таблице.
public class CertificateSkill
{
    public Guid Id { get; set; }

    // Ссылка на certificates.
    public Guid CertificateId { get; set; }

    // Ссылка на skills.
    public Guid SkillId { get; set; }

    public DateTime CreatedAt { get; set; }
}
