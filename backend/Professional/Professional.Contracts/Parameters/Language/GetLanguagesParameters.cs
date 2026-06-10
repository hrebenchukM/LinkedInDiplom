namespace Professional.Contracts.Parameters.Language;

public record GetLanguagesParameters
{
    public int Skip { get; init; }

    public int Take { get; init; }

    public string? Search { get; init; }

    public string? SortBy { get; init; }

    public string? SortDirection { get; init; }
}
