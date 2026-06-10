namespace Facade.FileStorage.Contracts.Services;

public interface IFileStorageService
{
    Task<string> SaveAsync(
        Stream stream,
        string originalFileName,
        string contentType,
        FileStoragePathOptions options,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Best-effort delete of a previously stored file URL (local /uploads or current S3 bucket only).
    /// External URLs and paths outside uploads root are ignored. Failures are swallowed.
    /// </summary>
    Task DeleteAsync(
        string? fileUrl,
        CancellationToken cancellationToken = default);
}
