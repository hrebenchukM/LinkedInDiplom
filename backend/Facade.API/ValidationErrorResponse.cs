using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Facade.API;

/// <summary>
/// Единый формат ответа для автоматической validation error от [ApiController].
/// </summary>
public sealed class ValidationErrorResponse
{
    public bool Success { get; init; }

    public IReadOnlyList<string> Errors { get; init; } = Array.Empty<string>();

    public IReadOnlyDictionary<string, string[]> FieldErrors { get; init; } =
        new Dictionary<string, string[]>();

    public static ValidationErrorResponse FromModelState(ModelStateDictionary modelState)
    {
        var fieldErrors = new Dictionary<string, string[]>(StringComparer.Ordinal);

        foreach (var entry in modelState.Where(e => e.Value?.Errors.Count > 0))
        {
            var messages = entry.Value!.Errors
                .Select(err => string.IsNullOrEmpty(err.ErrorMessage)
                    ? "The input was invalid."
                    : err.ErrorMessage)
                .ToArray();

            fieldErrors[entry.Key] = messages;
        }

        var errors = fieldErrors
            .SelectMany(kvp => kvp.Value.Select(msg => $"{kvp.Key}: {msg}"))
            .ToList();

        return new ValidationErrorResponse
        {
            Success = false,
            Errors = errors,
            FieldErrors = fieldErrors
        };
    }
}
