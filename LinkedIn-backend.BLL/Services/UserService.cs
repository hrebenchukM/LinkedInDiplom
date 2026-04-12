//using LinkedIn_backend.BLL.DTO;
//using LinkedIn_backend.DAL.Entities;
//using LinkedIn_backend.DAL.Interfaces;
//using LinkedIn_backend.BLL.Infrastructure;
//using LinkedIn_backend.BLL.Interfaces;
//using AutoMapper;

//namespace LinkedIn_backend.BLL.Services
//{
//    public class UserService : IUserService
//    {
//        IUnitOfWork Database { get; set; }

//        public UserService(IUnitOfWork uow)
//        {
//            Database = uow;
//        }

//        public async Task<UserDTO> CreateUser(UserDTO userDto)
//        {
//            var user = new User
//            {
//                Login = userDto.Login,
//                Password = userDto.Password,
//                Salt = userDto.Salt,
//                Role = userDto.Role
//            };
//            await Database.Users.Create(user);
//            await Database.Save();

//            return new UserDTO
//            {
//                Id = user.Id,
//                Login = user.Login,
//                Password = user.Password,
//                Salt = user.Salt,
//                Role = user.Role
//            };

//        }

//        //public async Task CreateUser(UserDTO userDto)
//        //{
//        //    var user = new User
//        //    {
//        //        Id = userDto.Id,
//        //        FirstName = userDto.FirstName,
//        //        LastName = userDto.LastName,
//        //        Login = userDto.Login,
//        //        Password = userDto.Password,
//        //        Salt = userDto.Salt,
//        //        Role = userDto.Role,
//        //        IsActive = userDto.IsActive
//        //    };
//        //    await Database.Users.Create(user);
//        //    await Database.Save();
//        //}

//        public async Task UpdateUser(UserDTO userDto)
//        {
//            var user = new User
//            {
//                Id = userDto.Id,
//                Login = userDto.Login,
//                Password = userDto.Password,
//                Salt = userDto.Salt,
//                Role = userDto.Role
//            };
//            Database.Users.Update(user);
//            await Database.Save();
//        }

//        public async Task DeleteUser(int id)
//        {
//            await Database.Users.Delete(id);
//            await Database.Save();
//        }

//        public async Task<UserDTO> GetUser(int id)
//        {
//            var user = await Database.Users.Get(id);
//            if (user == null)
//                throw new ValidationException("Wrong user!", "");

//            return new UserDTO
//            {
//                Id = user.Id,
//                Login = user.Login,
//                Password = user.Password,
//                Salt = user.Salt,
//                Role = user.Role
//            };
//        }

//        // Automapper позволяет проецировать одну модель на другую, что позволяет сократить объемы кода и упростить программу.
//        public async Task<IEnumerable<UserDTO>> GetUsers()
//        {
//            var mapper = new MapperConfiguration(cfg => cfg.CreateMap<User, UserDTO>()).CreateMapper();
//            return mapper.Map<IEnumerable<User>, IEnumerable<UserDTO>>(await Database.Users.GetList());
//        }

//        public async Task<IEnumerable<UserDTO>> GetInactiveUsers()
//        {
//            var mapper = new MapperConfiguration(cfg => cfg.CreateMap<User, UserDTO>()).CreateMapper();
//            return mapper.Map<IEnumerable<User>, IEnumerable<UserDTO>>(await Database.Users.GetInactiveUsers());
//        }



//    }
//}
