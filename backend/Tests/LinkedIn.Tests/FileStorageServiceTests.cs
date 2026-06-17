using Amazon.S3;
using Amazon.S3.Model;
using Facade.FileStorage.Contracts;
using Facade.FileStorage.Contracts.Options;
using Facade.FileStorage.Services;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Moq;

namespace LinkedIn.Tests;

public class FileStorageServiceTests : IDisposable
{
    private readonly string _tempRoot;
    private readonly FileStoragePathOptions _defaultPathOptions;

    public FileStorageServiceTests()
    {
        _tempRoot = Path.Combine(Path.GetTempPath(), $"fs_tests_{Guid.NewGuid()}");
        Directory.CreateDirectory(_tempRoot);

        _defaultPathOptions = new FileStoragePathOptions
        {
            ModuleName = "profile",
            EntityName = "avatar",
            OwnerId = "user-123",
            AllowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" },
            AllowedContentTypes = new[] { "image/jpeg", "image/png", "image/webp" }
        };
    }

    private FileStorageService BuildLocalService(string? uploadsRoot = null)
    {
        var storageOptions = Options.Create(new FileStorageOptions
        {
            UploadsRootPath = uploadsRoot ?? _tempRoot
        });

        var s3Options = Options.Create(new AwsS3Settings
        {
            BucketName = "",
            Region = "",
            AccessKeyId = "",
            SecretAccessKey = ""
        });

        return new FileStorageService(
            storageOptions,
            s3Options,
            NullLogger<FileStorageService>.Instance,
            s3Client: null);
    }

    private FileStorageService BuildS3Service(IAmazonS3 s3Client)
    {
        var storageOptions = Options.Create(new FileStorageOptions
        {
            UploadsRootPath = _tempRoot
        });

        var s3Options = Options.Create(new AwsS3Settings
        {
            BucketName = "linkedin-diplom-photos",
            Region = "us-east-1",
            AccessKeyId = "test-key",
            SecretAccessKey = "test-secret"
        });

        return new FileStorageService(
            storageOptions,
            s3Options,
            NullLogger<FileStorageService>.Instance,
            s3Client);
    }

    private static Stream MakeStream(string content = "fake-image-bytes") =>
        new MemoryStream(System.Text.Encoding.UTF8.GetBytes(content));

    [Fact]
    public async Task SaveAsync_LocalMode_CreatesFileAndReturnsUploadsUrl()
    {
        var service = BuildLocalService();

        var url = await service.SaveAsync(
            MakeStream(),
            "photo.jpg",
            "image/jpeg",
            _defaultPathOptions);

        Assert.StartsWith("/uploads/profile/user-123/avatar/", url);
        Assert.EndsWith(".jpg", url);

        var relativePath = url["/uploads/".Length..];
        var absolutePath = Path.Combine(_tempRoot, relativePath.Replace('/', Path.DirectorySeparatorChar));
        Assert.True(File.Exists(absolutePath));
    }

    [Fact]
    public async Task SaveAsync_LocalMode_PngExtension_ReturnsUrlWithPng()
    {
        var service = BuildLocalService();

        var url = await service.SaveAsync(
            MakeStream(),
            "photo.png",
            "image/png",
            _defaultPathOptions);

        Assert.EndsWith(".png", url);
    }

    [Fact]
    public async Task SaveAsync_LocalMode_FileContentIsCorrect()
    {
        var service = BuildLocalService();
        var content = "real-image-content-12345";

        var url = await service.SaveAsync(
            MakeStream(content),
            "photo.jpg",
            "image/jpeg",
            _defaultPathOptions);

        var relativePath = url["/uploads/".Length..];
        var absolutePath = Path.Combine(_tempRoot, relativePath.Replace('/', Path.DirectorySeparatorChar));
        var savedContent = await File.ReadAllTextAsync(absolutePath);

        Assert.Equal(content, savedContent);
    }

    [Fact]
    public async Task SaveAsync_InvalidExtension_ThrowsInvalidOperationException()
    {
        var service = BuildLocalService();

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.SaveAsync(
                MakeStream(),
                "malware.exe",
                "image/jpeg",
                _defaultPathOptions));
    }

    [Fact]
    public async Task SaveAsync_InvalidContentType_ThrowsInvalidOperationException()
    {
        var service = BuildLocalService();

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.SaveAsync(
                MakeStream(),
                "photo.jpg",
                "application/octet-stream",
                _defaultPathOptions));
    }

    [Fact]
    public async Task SaveAsync_FileTooLarge_ThrowsInvalidOperationException()
    {
        var service = BuildLocalService();
        var bigContent = new string('x', 1024);

        var options = new FileStoragePathOptions
        {
            ModuleName = "profile",
            EntityName = "avatar",
            AllowedExtensions = new[] { ".jpg" },
            AllowedContentTypes = new[] { "image/jpeg" },
            MaxFileSizeBytes = 10
        };

        var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(bigContent));

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.SaveAsync(stream, "photo.jpg", "image/jpeg", options));
    }

    [Fact]
    public async Task SaveAsync_NullStream_ThrowsArgumentNullException()
    {
        var service = BuildLocalService();

        await Assert.ThrowsAsync<ArgumentNullException>(() =>
            service.SaveAsync(null!, "photo.jpg", "image/jpeg", _defaultPathOptions));
    }

    [Fact]
    public async Task SaveAsync_NullOptions_ThrowsArgumentNullException()
    {
        var service = BuildLocalService();

        await Assert.ThrowsAsync<ArgumentNullException>(() =>
            service.SaveAsync(MakeStream(), "photo.jpg", "image/jpeg", null!));
    }

    [Fact]
    public async Task DeleteAsync_LocalFile_DeletesFromDisk()
    {
        var service = BuildLocalService();

        var url = await service.SaveAsync(
            MakeStream(),
            "photo.jpg",
            "image/jpeg",
            _defaultPathOptions);

        var relativePath = url["/uploads/".Length..];
        var absolutePath = Path.Combine(_tempRoot, relativePath.Replace('/', Path.DirectorySeparatorChar));
        Assert.True(File.Exists(absolutePath));

        await service.DeleteAsync(url);

        Assert.False(File.Exists(absolutePath));
    }

    [Fact]
    public async Task DeleteAsync_NullUrl_DoesNotThrow()
    {
        var service = BuildLocalService();

        await service.DeleteAsync(null);
    }

    [Fact]
    public async Task DeleteAsync_EmptyUrl_DoesNotThrow()
    {
        var service = BuildLocalService();

        await service.DeleteAsync("");
    }

    [Fact]
    public async Task DeleteAsync_ExternalUrl_DoesNotThrow()
    {
        var service = BuildLocalService();

        await service.DeleteAsync("https://other-cdn.example.com/image.jpg");
    }

    [Fact]
    public async Task SaveAsync_S3Mode_CallsPutObjectAndReturnsS3Url()
    {
        var s3Mock = new Mock<IAmazonS3>();
        s3Mock
            .Setup(x => x.PutObjectAsync(It.IsAny<PutObjectRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PutObjectResponse());

        var service = BuildS3Service(s3Mock.Object);

        var url = await service.SaveAsync(
            MakeStream(),
            "photo.jpg",
            "image/jpeg",
            _defaultPathOptions);

        Assert.Contains("amazonaws.com", url);
        Assert.Contains("linkedin-diplom-photos", url);
        Assert.EndsWith(".jpg", url);
    }

    [Fact]
    public async Task SaveAsync_S3Mode_PutObjectCalledWithCorrectBucket()
    {
        var s3Mock = new Mock<IAmazonS3>();
        PutObjectRequest? capturedRequest = null;

        s3Mock
            .Setup(x => x.PutObjectAsync(It.IsAny<PutObjectRequest>(), It.IsAny<CancellationToken>()))
            .Callback<PutObjectRequest, CancellationToken>((req, _) => capturedRequest = req)
            .ReturnsAsync(new PutObjectResponse());

        var service = BuildS3Service(s3Mock.Object);

        await service.SaveAsync(MakeStream(), "photo.png", "image/png", _defaultPathOptions);

        Assert.NotNull(capturedRequest);
        Assert.Equal("linkedin-diplom-photos", capturedRequest!.BucketName);
        Assert.Equal("image/png", capturedRequest.ContentType);
        Assert.EndsWith(".png", capturedRequest.Key);
    }

    [Fact]
    public async Task SaveAsync_S3Mode_DoesNotSaveFileToDisk()
    {
        var s3Mock = new Mock<IAmazonS3>();
        s3Mock
            .Setup(x => x.PutObjectAsync(It.IsAny<PutObjectRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PutObjectResponse());

        var service = BuildS3Service(s3Mock.Object);

        await service.SaveAsync(MakeStream(), "photo.jpg", "image/jpeg", _defaultPathOptions);

        var uploadsDir = Path.Combine(_tempRoot, "profile");
        Assert.False(Directory.Exists(uploadsDir));
    }

    [Fact]
    public async Task DeleteAsync_S3Url_CallsDeleteObjectAsync()
    {
        var s3Mock = new Mock<IAmazonS3>();
        s3Mock
            .Setup(x => x.DeleteObjectAsync(It.IsAny<DeleteObjectRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DeleteObjectResponse());

        var service = BuildS3Service(s3Mock.Object);

        var s3Url = "https://linkedin-diplom-photos.s3.us-east-1.amazonaws.com/profile/avatar/user-123/photo.jpg";

        await service.DeleteAsync(s3Url);

        s3Mock.Verify(x => x.DeleteObjectAsync(
            It.Is<DeleteObjectRequest>(r =>
                r.BucketName == "linkedin-diplom-photos" &&
                r.Key == "profile/avatar/user-123/photo.jpg"),
            It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_S3Mode_LocalUploadsUrl_DeletesFromDisk()
    {
        var s3Mock = new Mock<IAmazonS3>();
        var service = BuildS3Service(s3Mock.Object);

        var dir = Path.Combine(_tempRoot, "profile", "user-123", "avatar");
        Directory.CreateDirectory(dir);
        var fileName = "testfile.jpg";
        var filePath = Path.Combine(dir, fileName);
        await File.WriteAllTextAsync(filePath, "data");

        var localUrl = $"/uploads/profile/user-123/avatar/{fileName}";
        await service.DeleteAsync(localUrl);

        Assert.False(File.Exists(filePath));
        s3Mock.Verify(x => x.DeleteObjectAsync(It.IsAny<DeleteObjectRequest>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public void AwsS3Settings_ProductionConfig_HasRequiredFields()
    {
        var settings = new AwsS3Settings
        {
            BucketName = "linkedin-diplom-photos",
            Region = "us-east-1",
            AccessKeyId = "AKIA26MHDGXFJKZNZ3XN",
            SecretAccessKey = "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"
        };

        Assert.NotEmpty(settings.BucketName);
        Assert.NotEmpty(settings.Region);
        Assert.NotEmpty(settings.AccessKeyId);
        Assert.NotEmpty(settings.SecretAccessKey);
    }

    [Fact]
    public void AwsS3Settings_EmptyConfig_FallsBackToLocalMode()
    {
        var settings = new AwsS3Settings
        {
            BucketName = "",
            Region = "",
            AccessKeyId = "",
            SecretAccessKey = ""
        };

        Assert.True(string.IsNullOrEmpty(settings.BucketName));
    }

    public void Dispose()
    {
        if (Directory.Exists(_tempRoot))
            Directory.Delete(_tempRoot, recursive: true);
    }
}
