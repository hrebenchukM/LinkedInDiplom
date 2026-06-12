namespace Network.Contracts.Parameters.Page;

// Параметры удаления страницы — soft delete (OwnerId из JWT)
public record DeletePageParameters
{
    public string OwnerId { get; init; } = default!;

    public Guid PageId { get; init; }
}
