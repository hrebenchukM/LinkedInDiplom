using System.ComponentModel.DataAnnotations;

namespace Facade.AdminManagement.Contracts.Requests;

public record LockUserRequest : IValidatableObject
{
    public DateTimeOffset? LockoutEnd { get; init; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (LockoutEnd.HasValue && LockoutEnd <= DateTimeOffset.UtcNow)
        {
            yield return new ValidationResult(
                "LockoutEnd must be in the future.",
                [nameof(LockoutEnd)]);
        }
    }
}
