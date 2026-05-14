namespace Facade.AccountManagement.Contracts.DTOs;

// DTO аккаунта для клиента (UI / фронт)
public record AccountDto
{
    public string Id { get; init; } = default!;

    public string UserName { get; init; } = default!;

    public string Email { get; init; } = default!;

    public DateTime CreatedAt { get; init; }

    public DateTime? UpdatedAt { get; init; }
}