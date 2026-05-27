namespace Jobs.Contracts.Parameters.JobSearchResult;

public record UpsertJobSearchResultsParameters
{
    public string UserId { get; init; } = default!;
    public Guid SearchId { get; init; }
    public IReadOnlyCollection<Guid> VacancyIds { get; init; } = Array.Empty<Guid>();
}
