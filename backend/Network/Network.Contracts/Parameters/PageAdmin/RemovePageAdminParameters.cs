namespace Network.Contracts.Parameters.PageAdmin;

// Параметры отзыва администратора страницы (OwnerId из JWT)
public record RemovePageAdminParameters
{
    public string OwnerId { get; init; } = default!;

    public Guid PageId { get; init; }

    public string UserId { get; init; } = default!;
}
