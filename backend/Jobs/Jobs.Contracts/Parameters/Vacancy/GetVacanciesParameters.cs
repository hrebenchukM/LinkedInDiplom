namespace Jobs.Contracts.Parameters.Vacancy;

public record GetVacanciesParameters
{
    public string UserId { get; init; } = default!;

    public int Skip { get; init; }

    public int Take { get; init; }

    public Guid? CompanyId { get; init; }

    public string? PostedByUserId { get; init; }

    public string? Query { get; init; }

    public string? Location { get; init; }

    public string? JobType { get; init; }

    public string? Schedule { get; init; }

    public decimal? MinSalaryFrom { get; init; }

    public DateTime? FromCreatedAt { get; init; }

    public DateTime? ToCreatedAt { get; init; }

    public string? SortBy { get; init; }

    public string? SortDirection { get; init; }
}
