namespace LinkedIn_backend.BLL.DTO
{
    public class UserDTO
    {
        public int Id { get; set; }
        public string? Login { get; set; }
        public string? Password { get; set; }
        public string? Salt { get; set; }
        public string? Role { get; set; }
    }
}