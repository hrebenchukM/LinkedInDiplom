using Facade.ProfessionalManagement.Contracts.DTOs;

namespace Facade.ProfessionalManagement.Contracts.Responses;

// Ответ операций с образованием
public record EducationResponse
{
    public bool Success { get; init; }

    public EducationDto? Education { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
