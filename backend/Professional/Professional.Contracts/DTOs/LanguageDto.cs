namespace Professional.Contracts.DTOs;

// DTO языка в справочнике
public record LanguageDto
{
    public Guid Id { get; init; }

    public string Name { get; init; } = default!;

    public DateTime CreatedAt { get; init; }
}
