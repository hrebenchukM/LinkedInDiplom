namespace Jobs.Contracts.Parameters.JobApplication;

public record GetMyJobApplicationsParameters
{
    public string UserId { get; init; } = default!;
}
