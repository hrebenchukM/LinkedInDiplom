using System.ComponentModel.DataAnnotations;

namespace Facade.AccountManagement.Contracts.Requests;

public record RefreshTokenRequest
{
    [Required]
    public string RefreshToken { get; init; } = default!;
}
