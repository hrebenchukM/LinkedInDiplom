namespace Facade.AdminManagement.Contracts.Requests;

public class LockUserRequest
{
    public DateTimeOffset? LockoutEnd { get; set; }
}
