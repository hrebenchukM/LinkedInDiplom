using System.ComponentModel.DataAnnotations;

namespace Facade.AccountManagement.Contracts.Requests;

public class ExternalLoginRequest
{
    public string Provider { get; set; } = string.Empty;

    [Required]
    public string ProviderToken { get; set; } = string.Empty;
}
