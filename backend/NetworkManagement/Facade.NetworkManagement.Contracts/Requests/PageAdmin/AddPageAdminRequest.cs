using System.ComponentModel.DataAnnotations;

namespace Facade.NetworkManagement.Contracts.Requests.PageAdmin;

// Запрос на назначение администратора страницы (владелец из JWT)
public record AddPageAdminRequest
{
    [Required]
    public string UserId { get; init; } = default!;
}
