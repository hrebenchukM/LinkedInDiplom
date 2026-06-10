namespace Jobs.Contracts.Parameters.Vacancy;

public record GetAdminVacanciesParameters
{
    public int Skip { get; init; }

    public int Take { get; init; }

    public Guid? CompanyId { get; init; }

    public string? PostedByUserId { get; init; }

    public bool? IsDeleted { get; init; }

    public bool? IncludeDeleted { get; init; }

    public string? Search { get; init; }

    public DateTime? CreatedFrom { get; init; }

    public DateTime? CreatedTo { get; init; }

    public string? SortBy { get; init; }

    public string? SortDirection { get; init; }
}
