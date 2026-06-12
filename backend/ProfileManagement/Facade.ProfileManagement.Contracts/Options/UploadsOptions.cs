namespace Facade.ProfileManagement.Contracts.Options;

// Настройки корневой папки для загруженных файлов (аватары, header и т.д.).
// Абсолютный путь задаётся в Facade.API/Program.cs.
public class UploadsOptions
{
    public string RootPath { get; set; } = string.Empty;
}
