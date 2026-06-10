namespace Jobs.Contracts.DTOs;

public record AdminVacancyDto
{
    public Guid Id { get; init; }

    public Guid CompanyId { get; init; }

    public string PostedBy { get; init; } = default!;

    public string Title { get; init; } = default!;

    public string? JobType { get; init; }

    public string? Schedule { get; init; }

    public string? Location { get; init; }

    public string? Description { get; init; }

    public DateTime CreatedAt { get; init; }

    public DateTime? UpdatedAt { get; init; }

    public DateTime? DeletedAt { get; init; }

    public bool IsDeleted { get; init; }
}
