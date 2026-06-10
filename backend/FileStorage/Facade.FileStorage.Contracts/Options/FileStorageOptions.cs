namespace Facade.FileStorage.Contracts.Options;

// Корневая папка для локального хранения загруженных файлов.
// Абсолютный путь задаётся в AddFileStorage() на основе конфигурации и ContentRootPath.
public class FileStorageOptions
{
    public string UploadsRootPath { get; set; } = string.Empty;
}
