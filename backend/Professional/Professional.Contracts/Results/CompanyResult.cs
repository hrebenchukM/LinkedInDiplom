using Professional.Contracts.DTOs;

namespace Professional.Contracts.Results;

// Результат операции с компанией
public record CompanyResult
{
    public bool Succeeded { get; init; }

    public CompanyDto? Company { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}