using System.ComponentModel.DataAnnotations;

namespace Facade.AccountManagement.Contracts.Requests;
//фронт отправляет на бэк, когда человек входит через Google.
public class ExternalLoginRequest
{
    [Required]
    [StringLength(50, MinimumLength = 1)]
    public string Provider { get; set; } = string.Empty;//через кого входит юзер

    [Required]
    [StringLength(4000, MinimumLength = 1)]
    public string ProviderToken { get; set; } = string.Empty;//доказательство от Google, что юзер реально вошёл.
}
