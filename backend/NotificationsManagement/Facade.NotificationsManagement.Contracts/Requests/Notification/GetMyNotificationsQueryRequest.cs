using System.ComponentModel.DataAnnotations;
using Facade.Shared.Contracts.Pagination;

namespace Facade.NotificationsManagement.Contracts.Requests.Notification;

public record GetMyNotificationsQueryRequest : PagedRequest
{
    [Range(1, 100)]
    public int? Limit { get; init; }

    public bool? IsRead { get; init; }

    [StringLength(100)]
    public string? Type { get; init; }

    public DateTime? FromCreatedAt { get; init; }

    public DateTime? ToCreatedAt { get; init; }

    public (int Page, int PageSize, int Skip) ResolvePaging()
    {
        if (Limit is > 0)
        {
            if (Page != Pagination.DefaultPage || PageSize != Pagination.DefaultPageSize)
            {
                return Pagination.Normalize(this);
            }

            var pageSize = Math.Min(Limit.Value, Pagination.MaxPageSize);
            return (Pagination.DefaultPage, pageSize, 0);
        }

        return Pagination.Normalize(this);
    }
}
