using System.ComponentModel.DataAnnotations;
using Facade.Shared.Contracts.Pagination;

namespace Facade.EventsManagement.Contracts.Requests.Event;

public record AttendingEventsQueryRequest : PagedRequest, IValidatableObject
{
    public DateTime? FromStartAt { get; init; }

    public DateTime? ToStartAt { get; init; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (FromStartAt.HasValue && ToStartAt.HasValue && FromStartAt > ToStartAt)
        {
            yield return new ValidationResult(
                "FromStartAt must be less than or equal to ToStartAt.",
                [nameof(FromStartAt), nameof(ToStartAt)]);
        }
    }
}
