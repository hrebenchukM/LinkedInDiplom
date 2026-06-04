using Facade.ProfessionalManagement.Contracts.DTOs;

namespace Facade.ProfessionalManagement.Contracts.Responses;

// Ответ операций с учебным заведением
public record AcademyResponse
{
    public bool Success { get; init; }

    public AcademyDto? Academy { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
