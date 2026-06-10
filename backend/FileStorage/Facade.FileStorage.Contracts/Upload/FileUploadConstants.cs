namespace Facade.FileStorage.Contracts.Upload;

public static class FileUploadConstants
{
    public const long ImageMaxSizeBytes = 5 * 1024 * 1024;
    public const long DocumentMaxSizeBytes = 10 * 1024 * 1024;

    public static readonly string[] ProfileImageExtensions =
    [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    ];

    public static readonly string[] ProfileImageContentTypes =
    [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    public static readonly string[] GeneralImageExtensions =
    [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".gif"
    ];

    public static readonly string[] GeneralImageContentTypes =
    [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif"
    ];

    public static readonly string[] CertificateFileExtensions =
    [
        ".pdf",
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    ];

    public static readonly string[] CertificateFileContentTypes =
    [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    public static readonly string[] MessageMediaExtensions =
    [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".gif",
        ".pdf"
    ];

    public static readonly string[] MessageMediaContentTypes =
    [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "application/pdf"
    ];
}
