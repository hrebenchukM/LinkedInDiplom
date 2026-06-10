namespace Facade.FileStorage.Contracts.Services;

public interface IFileStorageService
{
    Task<string> SaveAsync(
        Stream stream,
        string originalFileName,
        string contentType,
        FileStoragePathOptions options,
        CancellationToken cancellationToken = default);
}
