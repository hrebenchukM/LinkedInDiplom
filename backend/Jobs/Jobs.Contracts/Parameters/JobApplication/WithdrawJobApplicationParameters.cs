namespace Jobs.Contracts.Parameters.JobApplication;

public record WithdrawJobApplicationParameters
{
    public string UserId { get; init; } = default!;
    public Guid ApplicationId { get; init; }
}
