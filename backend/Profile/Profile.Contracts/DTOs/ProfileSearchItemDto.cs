namespace Profile.Contracts.DTOs;

public record ProfileSearchItemDto
{
    public string UserId { get; init; } = default!;

    public string? FirstName { get; init; }

    public string? LastName { get; init; }

    public string? DisplayName { get; init; }

    public string? Headline { get; init; }

    public string? Location { get; init; }

    public string? AvatarUrl { get; init; }

    public string? HeaderUrl { get; init; }
}
