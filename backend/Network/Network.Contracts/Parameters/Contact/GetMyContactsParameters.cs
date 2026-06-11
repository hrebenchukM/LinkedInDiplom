namespace Network.Contracts.Parameters.Contact;

// Параметры получения контактов текущего пользователя (UserId из JWT)
public record GetMyContactsParameters
{
    public string UserId { get; init; } = default!;

    public int Skip { get; init; }

    public int Take { get; init; }

    // pending, accepted, rejected, cancelled; null — все статусы
    public string? Status { get; init; }

    // incoming, outgoing, accepted, all; null — без фильтра направления
    public string? Direction { get; init; }

    public string? Search { get; init; }

    public string? SortBy { get; init; }

    public string? SortDirection { get; init; }
}
