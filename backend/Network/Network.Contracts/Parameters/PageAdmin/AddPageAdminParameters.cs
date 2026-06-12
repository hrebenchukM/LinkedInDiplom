namespace Network.Contracts.Parameters.PageAdmin;

// Параметры назначения администратора страницы (OwnerId из JWT; role admin в service)
public record AddPageAdminParameters
{
    public string OwnerId { get; init; } = default!;

    public Guid PageId { get; init; }

    public string UserId { get; init; } = default!;
}
