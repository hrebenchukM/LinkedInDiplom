namespace Facade.FileStorage.Contracts.Upload;

public static class FileUploadValidation
{
    public const string EmptyFileMessage = "File is empty.";
    public const string ImageTooLargeMessage = "File is too large. Maximum size is 5 MB.";
    public const string DocumentTooLargeMessage = "File is too large. Maximum size is 10 MB.";

    public static string? Validate(long? fileLength, long maxSizeBytes, string tooLargeMessage)
    {
        if (fileLength is null or 0)
        {
            return EmptyFileMessage;
        }

        if (fileLength > maxSizeBytes)
        {
            return tooLargeMessage;
        }

        return null;
    }
}
