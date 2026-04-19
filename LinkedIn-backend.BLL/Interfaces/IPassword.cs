using LinkedIn_backend.BLL.DTO;

namespace LinkedIn_backend.BLL.Interfaces
{
    public interface IPassword
    {
        string GenerateSalt();
        string HashPassword(string salt, string password);
    }
}
