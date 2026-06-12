namespace Content.Contracts.Parameters.Media;

// Параметры регистрации медиа (только Url и Type, без blob)
public record CreateMediaParameters
{
    public string Url { get; init; } = default!;

    public string Type { get; init; } = default!;
}
