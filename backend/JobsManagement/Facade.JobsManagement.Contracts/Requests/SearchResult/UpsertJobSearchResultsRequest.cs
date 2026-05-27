namespace Facade.JobsManagement.Contracts.Requests.SearchResult;

public record UpsertJobSearchResultsRequest
{
    public IReadOnlyCollection<Guid> VacancyIds { get; init; } = Array.Empty<Guid>();
}
