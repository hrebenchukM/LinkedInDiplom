using Microsoft.AspNetCore.Mvc;
using LinkedIn_backend.BLL.DTO;
using LinkedIn_backend.BLL.Interfaces;
using LinkedIn_backend.BLL.Infrastructure;

namespace LinkedIn_backend.Controllers
{
    [ApiController]
    [Route("api/Users")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService userService;
        private readonly IPassword passwordService;

        public UsersController(IUserService userserv, IPassword ps)
        {
            userService = userserv;
            passwordService = ps;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetUsers()
        {
            var users = await userService.GetUsers();
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserDTO>> GetUser(int id)
        {
            try
            {
                UserDTO user = await userService.GetUser(id);
                return Ok(user);
            }
            catch (ValidationException)
            {
                return NotFound();
            }
        }

        [HttpPut]
        public async Task<ActionResult<UserDTO>> PutUser(UserDTO user)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (!await userService.ExistsUser(user.Id))
            {
                return NotFound();
            }

            user.Salt = passwordService.GenerateSalt();
            user.Password = passwordService.HashPassword(user.Salt, user.Password!);

            await userService.UpdateUser(user);
            return Ok(user);
        }

        [HttpPost]
        public async Task<ActionResult<UserDTO>> PostUser(UserDTO user)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            user.Salt = passwordService.GenerateSalt();
            user.Password = passwordService.HashPassword(user.Salt, user.Password!);

            var created = await userService.CreateUser(user);
            return Ok(created);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<UserDTO>> DeleteUser(int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                UserDTO user = await userService.GetUser(id);
                await userService.DeleteUser(id);
                return Ok(user);
            }
            catch (ValidationException)
            {
                return NotFound();
            }
        }
    }
}