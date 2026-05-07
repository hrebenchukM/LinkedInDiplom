using System.ComponentModel.DataAnnotations;

namespace Facade.AccountManagement.Contracts.Requests;

// Запрос обновления токена
public record RefreshTokenRequest
{
    [Required]
    public string RefreshToken { get; init; } = default!;
}