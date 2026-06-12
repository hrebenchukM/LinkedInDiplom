using Amazon.S3;
using Amazon.S3.Model;
using Facade.FileStorage.Contracts;
using Facade.FileStorage.Contracts.Options;
using Facade.FileStorage.Contracts.Services;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Facade.FileStorage.Services;

public class FileStorageService : IFileStorageService
{
    private const string UploadsUrlPrefix = "/uploads/";

    private readonly FileStorageOptions _fileStorageOptions;
    private readonly AwsS3Settings _s3Settings;
    private readonly IAmazonS3? _s3Client;
    private readonly ILogger<FileStorageService> _logger;

    public FileStorageService(
        IOptions<FileStorageOptions> fileStorageOptions,
        IOptions<AwsS3Settings> s3Settings,
        ILogger<FileStorageService> logger,
        IAmazonS3? s3Client = null)
    {
        _fileStorageOptions = fileStorageOptions.Value;
        _s3Settings = s3Settings.Value;
        _logger = logger;
        _s3Client = s3Client;
    }

    public async Task<string> SaveAsync(
        Stream stream,
        string originalFileName,
        string contentType,
        FileStoragePathOptions options,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(stream);
        ArgumentNullException.ThrowIfNull(options);

        if (string.IsNullOrWhiteSpace(options.ModuleName))
            throw new ArgumentException("ModuleName is required.", nameof(options));

        if (string.IsNullOrWhiteSpace(options.EntityName))
            throw new ArgumentException("EntityName is required.", nameof(options));

        var extension = GetSafeExtension(originalFileName);

        ValidateExtension(extension, options.AllowedExtensions);
        ValidateContentType(contentType, options.AllowedContentTypes);
        await ValidateFileSizeAsync(stream, options.MaxFileSizeBytes, cancellationToken);

        var newFileName = $"{Guid.NewGuid()}{extension}";

        if (!string.IsNullOrWhiteSpace(_s3Settings.BucketName) && _s3Client != null)
        {
            return await SaveToS3Async(
                stream,
                contentType,
                options,
                newFileName,
                cancellationToken);
        }

        return await SaveLocallyAsync(
            stream,
            options,
            newFileName,
            cancellationToken);
    }

    public async Task DeleteAsync(string? fileUrl, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(fileUrl))
            return;

        var normalizedUrl = fileUrl.Trim();

        try
        {
            if (IsLocalUploadsUrl(normalizedUrl))
            {
                DeleteLocalFile(normalizedUrl);
                return;
            }

            if (TryExtractS3ObjectKey(normalizedUrl, out var objectKey))
                await DeleteS3ObjectAsync(objectKey, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to delete stored file at {FileUrl}", normalizedUrl);
        }
    }

    private static bool IsLocalUploadsUrl(string fileUrl) =>
        fileUrl.StartsWith(UploadsUrlPrefix, StringComparison.OrdinalIgnoreCase);

    private void DeleteLocalFile(string fileUrl)
    {
        var relativeAfterUploads = fileUrl[UploadsUrlPrefix.Length..];
        if (string.IsNullOrWhiteSpace(relativeAfterUploads))
            return;

        var segments = relativeAfterUploads.Split('/', StringSplitOptions.RemoveEmptyEntries);
        if (segments.Any(segment => segment is "." or ".."))
            return;

        var uploadsRoot = Path.GetFullPath(_fileStorageOptions.UploadsRootPath);
        var candidatePath = Path.GetFullPath(Path.Combine(uploadsRoot, Path.Combine(segments)));

        if (!IsUnderDirectory(uploadsRoot, candidatePath))
            return;

        if (!File.Exists(candidatePath))
            return;

        File.Delete(candidatePath);
    }

    private static bool IsUnderDirectory(string rootDirectory, string candidatePath)
    {
        var normalizedRoot = rootDirectory.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
        var prefix = normalizedRoot + Path.DirectorySeparatorChar;

        return candidatePath.Equals(normalizedRoot, StringComparison.OrdinalIgnoreCase)
            || candidatePath.StartsWith(prefix, StringComparison.OrdinalIgnoreCase);
    }

    private bool TryExtractS3ObjectKey(string fileUrl, out string objectKey)
    {
        objectKey = string.Empty;

        if (string.IsNullOrWhiteSpace(_s3Settings.BucketName) || _s3Client is null)
            return false;

        if (!Uri.TryCreate(fileUrl, UriKind.Absolute, out var uri))
            return false;

        if (!uri.Scheme.Equals(Uri.UriSchemeHttps, StringComparison.OrdinalIgnoreCase))
            return false;

        if (!IsCurrentBucketHost(uri.Host))
            return false;

        objectKey = Uri.UnescapeDataString(uri.AbsolutePath.TrimStart('/'));
        return !string.IsNullOrWhiteSpace(objectKey);
    }

    private bool IsCurrentBucketHost(string host)
    {
        var bucket = _s3Settings.BucketName.Trim();

        if (host.Equals($"{bucket}.s3.amazonaws.com", StringComparison.OrdinalIgnoreCase))
            return true;

        var region = _s3Settings.Region?.Trim();
        if (string.IsNullOrWhiteSpace(region))
            return false;

        return host.Equals($"{bucket}.s3.{region}.amazonaws.com", StringComparison.OrdinalIgnoreCase);
    }

    private async Task DeleteS3ObjectAsync(string objectKey, CancellationToken cancellationToken)
    {
        var deleteRequest = new DeleteObjectRequest
        {
            BucketName = _s3Settings.BucketName,
            Key = objectKey
        };

        await _s3Client!.DeleteObjectAsync(deleteRequest, cancellationToken);
    }

    private async Task<string> SaveLocallyAsync(
        Stream stream,
        FileStoragePathOptions options,
        string newFileName,
        CancellationToken cancellationToken)
    {
        var relativeSegments = BuildRelativePathSegments(options);
        var directoryPath = Path.Combine(
            new[] { _fileStorageOptions.UploadsRootPath }.Concat(relativeSegments).ToArray());

        if (!Directory.Exists(directoryPath))
        {
            Directory.CreateDirectory(directoryPath);
        }

        var filePath = Path.Combine(directoryPath, newFileName);

        await using var outputStream = new FileStream(filePath, FileMode.Create);
        await stream.CopyToAsync(outputStream, cancellationToken);

        var urlSegments = new List<string> { "uploads" };
        urlSegments.AddRange(relativeSegments);
        urlSegments.Add(newFileName);

        return "/" + string.Join('/', urlSegments);
    }

    private async Task<string> SaveToS3Async(
        Stream stream,
        string contentType,
        FileStoragePathOptions options,
        string newFileName,
        CancellationToken cancellationToken)
    {
        var objectKey = BuildS3ObjectKey(options, newFileName);

        var putRequest = new PutObjectRequest
        {
            BucketName = _s3Settings.BucketName,
            Key = objectKey,
            InputStream = stream,
            ContentType = contentType
        };

        await _s3Client!.PutObjectAsync(putRequest, cancellationToken);

        return BuildS3ObjectUrl(objectKey);
    }

    private static List<string> BuildRelativePathSegments(FileStoragePathOptions options)
    {
        var segments = new List<string> { options.ModuleName.Trim('/') };

        if (!string.IsNullOrWhiteSpace(options.OwnerId))
            segments.Add(options.OwnerId.Trim('/'));

        if (!string.IsNullOrWhiteSpace(options.EntityId))
            segments.Add(options.EntityId.Trim('/'));

        segments.Add(options.EntityName.Trim('/'));

        return segments;
    }

    private static string BuildS3ObjectKey(FileStoragePathOptions options, string newFileName)
    {
        var segments = new List<string> { options.ModuleName.Trim('/') };
        segments.Add(options.EntityName.Trim('/'));

        if (!string.IsNullOrWhiteSpace(options.OwnerId))
            segments.Add(options.OwnerId.Trim('/'));

        if (!string.IsNullOrWhiteSpace(options.EntityId))
            segments.Add(options.EntityId.Trim('/'));

        segments.Add(newFileName);

        return string.Join('/', segments);
    }

    private string BuildS3ObjectUrl(string objectKey)
    {
        var bucket = _s3Settings.BucketName;
        var region = _s3Settings.Region?.Trim();

        if (string.IsNullOrWhiteSpace(region))
            return $"https://{bucket}.s3.amazonaws.com/{objectKey}";

        return $"https://{bucket}.s3.{region}.amazonaws.com/{objectKey}";
    }

    private static string GetSafeExtension(string originalFileName)
    {
        var extension = Path.GetExtension(originalFileName).ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(extension) || extension.Length > 10)
            throw new InvalidOperationException("File extension is not allowed.");

        var extensionWithoutDot = extension[1..];

        if (!extensionWithoutDot.All(char.IsLetterOrDigit))
            throw new InvalidOperationException("File extension is not allowed.");

        return extension;
    }

    private static void ValidateExtension(string extension, string[]? allowedExtensions)
    {
        if (allowedExtensions is not { Length: > 0 })
            return;

        if (!allowedExtensions.Contains(extension, StringComparer.OrdinalIgnoreCase))
            throw new InvalidOperationException("File extension is not allowed.");
    }

    private static void ValidateContentType(string contentType, string[]? allowedContentTypes)
    {
        if (allowedContentTypes is not { Length: > 0 })
            return;

        if (!allowedContentTypes.Contains(contentType.ToLowerInvariant()))
            throw new InvalidOperationException("Content type is not allowed.");
    }

    private static Task ValidateFileSizeAsync(
        Stream stream,
        long? maxFileSizeBytes,
        CancellationToken cancellationToken)
    {
        if (!maxFileSizeBytes.HasValue)
            return Task.CompletedTask;

        if (!stream.CanSeek)
            return Task.CompletedTask;

        if (stream.Length > maxFileSizeBytes.Value)
            throw new InvalidOperationException("File size exceeds the allowed limit.");

        return Task.CompletedTask;
    }
}
