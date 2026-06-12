namespace Network.Contracts.Parameters.Page;

// Параметры получения страницы по Id (UserId из JWT — проверка доступа)
public record GetPageByIdParameters
{
    public string UserId { get; init; } = default!;

    public Guid PageId { get; init; }
}
