using Facade.AccountManagement.Contracts.DTOs;

namespace Facade.AccountManagement.Contracts.Responses;

// Ответ регистрации
public record RegisterResponse
{
    public bool Success { get; init; } // успешно ли

    public AccountDto? Account { get; init; } // созданный пользователь

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>(); // ошибки
}