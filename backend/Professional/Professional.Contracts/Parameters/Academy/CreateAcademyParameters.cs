namespace Professional.Contracts.Parameters.Academy;

// Создать учебное заведение
public record CreateAcademyParameters
{
    public string Name { get; init; } = default!;

    public string? LogoUrl { get; init; }

    public string? WebsiteUrl { get; init; }
}
