namespace Facade.API.Seeding;

public sealed class SeedStepResult
{
    public string StepName { get; init; } = string.Empty;

    public bool Succeeded { get; init; }

    public string? ErrorMessage { get; init; }

    public DateTime StartedAtUtc { get; init; }

    public DateTime FinishedAtUtc { get; init; }

    public long DurationMs => (long)(FinishedAtUtc - StartedAtUtc).TotalMilliseconds;

    public static SeedStepResult Success(string stepName, DateTime startedAtUtc, DateTime finishedAtUtc) =>
        new()
        {
            StepName = stepName,
            Succeeded = true,
            StartedAtUtc = startedAtUtc,
            FinishedAtUtc = finishedAtUtc,
        };

    public static SeedStepResult Failed(
        string stepName,
        DateTime startedAtUtc,
        DateTime finishedAtUtc,
        string errorMessage) =>
        new()
        {
            StepName = stepName,
            Succeeded = false,
            ErrorMessage = errorMessage,
            StartedAtUtc = startedAtUtc,
            FinishedAtUtc = finishedAtUtc,
        };
}
