namespace Facade.ProfessionalManagement.Contracts.DTOs;

// DTO языка в справочнике для frontend / Swagger
public record LanguageDto
{
    public Guid Id { get; init; }

    public string Name { get; init; } = default!;

    public DateTime CreatedAt { get; init; }
}
