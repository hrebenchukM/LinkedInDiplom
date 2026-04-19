using LinkedIn_backend.BLL.DTO;

namespace LinkedIn_backend.BLL.Interfaces
{
    public interface IUserService
    {
        Task<UserDTO> CreateUser(UserDTO userDto);
        Task UpdateUser(UserDTO userDto);
        Task DeleteUser(int id);
        Task<UserDTO> GetUser(int id);
        Task<IEnumerable<UserDTO>> GetUsers();
        Task<bool> ExistsUser(int id);
    }
}