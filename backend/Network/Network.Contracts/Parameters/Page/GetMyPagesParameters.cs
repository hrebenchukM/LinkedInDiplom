namespace Network.Contracts.Parameters.Page;

// Параметры получения страниц текущего пользователя (OwnerId из JWT)
public record GetMyPagesParameters
{
    public string OwnerId { get; init; } = default!;
}
