namespace Identity.Contracts.DTOs;

public record RoleDto
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
}
