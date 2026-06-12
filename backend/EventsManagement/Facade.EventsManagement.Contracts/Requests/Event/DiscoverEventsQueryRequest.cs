using System.ComponentModel.DataAnnotations;
using Facade.Shared.Contracts.Pagination;

namespace Facade.EventsManagement.Contracts.Requests.Event;

public record DiscoverEventsQueryRequest : PagedRequest, IValidatableObject
{
    [StringLength(200)]
    public string? Query { get; init; }

    public DateTime? FromStartAt { get; init; }

    public DateTime? ToStartAt { get; init; }

    [StringLength(256)]
    public string? OrganizerUserId { get; init; }

    [StringLength(200)]
    public string? Location { get; init; }

    public bool? IsOnline { get; init; }

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
