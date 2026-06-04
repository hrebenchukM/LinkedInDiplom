namespace Professional.DataAccess.Entities;

// Язык в глобальном справочнике Professional-модуля
public class Language
{
    public Guid Id { get; set; }

    public string Name { get; set; } = default!;

    public DateTime CreatedAt { get; set; }
}
