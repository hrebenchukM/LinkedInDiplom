using System.ComponentModel.DataAnnotations;

namespace Facade.AccountManagement.Contracts.Requests;

public record RegisterRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; init; } = default!;

    [Required]
    [MinLength(3)]
    [MaxLength(50)]
    public string UserName { get; init; } = default!;

    [Required]
    [MinLength(6)]
    public string Password { get; init; } = default!;

    [MaxLength(50)]
    public string? FirstName { get; init; }

    [MaxLength(50)]
    public string? LastName { get; init; }
}
