namespace Jobs.Events.Contracts.Events;

public record VacancyApplicationSubmittedEvent
{
    public Guid ApplicationId { get; init; }

    public Guid VacancyId { get; init; }

    public string VacancyTitle { get; init; } = default!;

    public string ApplicantUserId { get; init; } = default!;

    public string PostedByUserId { get; init; } = default!;

    public DateTime AppliedAt { get; init; }
}
