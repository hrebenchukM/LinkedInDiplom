using System.ComponentModel.DataAnnotations;
using Facade.Shared.Contracts.Pagination;

namespace Facade.NetworkManagement.Contracts.Requests.Contact;

public record GetMyContactsQueryRequest : PagedRequest
{
    [AllowedValues("pending", "accepted", "rejected", "cancelled")]
    public string? Status { get; init; }

    [AllowedValues("incoming", "outgoing", "accepted", "all")]
    public string? Direction { get; init; }

    [StringLength(450)]
    public string? Search { get; init; }

    [AllowedValues("requestedAt", "respondedAt", "statusChangedAt", "status")]
    public string? SortBy { get; init; }

    [AllowedValues("asc", "desc")]
    public string? SortDirection { get; init; }
}
