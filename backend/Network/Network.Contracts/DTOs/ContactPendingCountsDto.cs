namespace Network.Contracts.DTOs;

public record ContactPendingCountsDto
{
    public int IncomingCount { get; init; }

    public int OutgoingCount { get; init; }
}
