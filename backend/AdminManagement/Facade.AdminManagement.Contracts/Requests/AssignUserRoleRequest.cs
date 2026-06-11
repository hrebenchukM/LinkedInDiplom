using System.ComponentModel.DataAnnotations;
using Identity.Contracts.Constants;

namespace Facade.AdminManagement.Contracts.Requests;

public record AssignUserRoleRequest
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    [AllowedValues(IdentityRoleNames.Admin, IdentityRoleNames.User)]
    public string RoleName { get; init; } = default!;
}
