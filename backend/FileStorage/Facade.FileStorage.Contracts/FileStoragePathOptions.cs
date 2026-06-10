namespace Facade.FileStorage.Contracts;

public class FileStoragePathOptions
{
    public string ModuleName { get; set; } = string.Empty;

    public string EntityName { get; set; } = string.Empty;

    public string? OwnerId { get; set; }

    public string? EntityId { get; set; }

    public string[]? AllowedExtensions { get; set; }

    public string[]? AllowedContentTypes { get; set; }

    public long? MaxFileSizeBytes { get; set; }
}
