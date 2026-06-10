namespace Professional.Contracts.Parameters.Academy;

// Параметры частичного обновления учебного заведения.
// Если поле null — значит его не меняем.
public record PatchAcademyParameters
{
    public Guid AcademyId { get; init; }

    public string? Name { get; init; }

    public string? LogoUrl { get; init; }

    public string? WebsiteUrl { get; init; }
}
