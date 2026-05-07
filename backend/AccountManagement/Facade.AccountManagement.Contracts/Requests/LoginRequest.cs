using System.ComponentModel.DataAnnotations;

namespace Facade.AccountManagement.Contracts.Requests;

// Запрос логина
public record LoginRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; init; } = default!;

    [Required]
    public string Password { get; init; } = default!;
}