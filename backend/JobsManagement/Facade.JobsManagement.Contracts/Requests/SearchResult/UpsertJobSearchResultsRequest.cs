using System.ComponentModel.DataAnnotations;

namespace Facade.JobsManagement.Contracts.Requests.SearchResult;

public record UpsertJobSearchResultsRequest
{
    [Required]
    [MinLength(1)]
    public IReadOnlyCollection<Guid> VacancyIds { get; init; } = Array.Empty<Guid>();
}
