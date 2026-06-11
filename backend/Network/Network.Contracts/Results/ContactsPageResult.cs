using Network.Contracts.DTOs;

namespace Network.Contracts.Results;

public record ContactsPageResult
{
    public IReadOnlyCollection<ContactDto> Items { get; init; } = Array.Empty<ContactDto>();

    public int TotalCount { get; init; }
}
