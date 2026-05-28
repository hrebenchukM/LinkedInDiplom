using System.ComponentModel.DataAnnotations;

namespace Facade.AccountManagement.Contracts.Requests;

public class ExternalLoginRequest
{
    [Required]
    [StringLength(50, MinimumLength = 1)]
    public string Provider { get; set; } = string.Empty;

    [Required]
    [StringLength(4000, MinimumLength = 1)]
    public string ProviderToken { get; set; } = string.Empty;
}
