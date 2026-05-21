using Facade.ProfessionalManagement.Contracts.DTOs;

namespace Facade.ProfessionalManagement.Contracts.Responses;

// Ответ операций с компанией
public record CompanyResponse
{
    public bool Success { get; init; }

    public CompanyDto? Company { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}