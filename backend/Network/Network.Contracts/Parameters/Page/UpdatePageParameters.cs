namespace Network.Contracts.Parameters.Page;

// Параметры обновления страницы (OwnerId из JWT)
public record UpdatePageParameters
{
    public string OwnerId { get; init; } = default!;

    public Guid PageId { get; init; }

    public string Name { get; init; } = default!;

    public string? Description { get; init; }

    public string? LogoUrl { get; init; }
}
