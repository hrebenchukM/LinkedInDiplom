using Facade.AccountManagement.Contracts.DTOs;

namespace Facade.AccountManagement.Contracts.Responses;

public class ExternalLoginResponse
{
    public bool Success { get; set; }
    public AccountDto? Account { get; set; }
    public AuthTokenDto? Token { get; set; }
    public IEnumerable<string> Errors { get; set; } = Array.Empty<string>();
    public bool IsNewUser { get; set; }
}
