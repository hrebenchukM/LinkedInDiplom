using System.ComponentModel.DataAnnotations;

namespace Facade.AccountManagement.Contracts.Requests;

// Запрос на регистрацию аккаунта.
// Здесь только данные, которые относятся к Identity/Auth.
public record RegisterRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; init; } = default!;

    [Required]
    [MinLength(6)]
    public string Password { get; init; } = default!;
}