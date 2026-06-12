namespace Network.Contracts.Parameters.Page;

// Параметры создания страницы (OwnerId из JWT)
public record CreatePageParameters
{
    public string OwnerId { get; init; } = default!;

    public string Name { get; init; } = default!;

    public string? Description { get; init; }

    public string? LogoUrl { get; init; }
}
