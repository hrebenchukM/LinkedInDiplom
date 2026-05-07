namespace Facade.AccountManagement.Contracts.DTOs;

// DTO аккаунта для клиента (UI / фронт)
public record AccountDto
{
    public string Id { get; init; } = default!; // Id пользователя

    public string UserName { get; init; } = default!; // логин

    public string Email { get; init; } = default!; // email

    public string? FirstName { get; init; } // имя

    public string? LastName { get; init; } // фамилия

    public string? FullName { get; init; } // вычисляемое поле (First + Last)

    public string? ProfilePictureUrl { get; init; } // аватар

    public DateTime CreatedAt { get; init; } // дата создания
}