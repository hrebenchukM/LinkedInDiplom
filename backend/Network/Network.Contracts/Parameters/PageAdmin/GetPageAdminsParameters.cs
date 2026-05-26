namespace Network.Contracts.Parameters.PageAdmin;

// Параметры списка администраторов страницы (UserId из JWT — проверка доступа)
public record GetPageAdminsParameters
{
    public string UserId { get; init; } = default!;

    public Guid PageId { get; init; }
}
