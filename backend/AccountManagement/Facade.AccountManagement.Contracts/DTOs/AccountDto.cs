namespace Facade.AccountManagement.Contracts.DTOs;

public record AccountDto
{
    public string Id { get; init; } = default!;
    public string UserName { get; init; } = default!;
    public string Email { get; init; } = default!;
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string? FullName { get; init; }
    public string? ProfilePictureUrl { get; init; }
    public DateTime CreatedAt { get; init; }
}
