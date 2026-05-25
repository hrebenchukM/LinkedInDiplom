namespace Professional.Contracts.Parameters.Language;

// Создать язык в справочнике
public record CreateLanguageParameters
{
    public string Name { get; init; } = default!;
}
