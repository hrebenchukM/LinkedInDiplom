using Microsoft.AspNetCore.Mvc;//все равно надо 

using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using LinkedIn_backend.BLL.DTO;
using LinkedIn_backend.BLL.Interfaces;
using LinkedIn_backend.BLL.Infrastructure;
using Humanizer.Localisation;
using LinkedIn_backend.BLL.Services;
namespace LinkedIn_backend.Controllers
{
    [ApiController]
    [Route("api/Users")]
    public class UsersController : ControllerBase//класс по сути является WebAPI службой
    {
        private readonly IUserService userService;
        private readonly IPassword passwordService;
        public UsersController(IUserService userserv, IPassword ps)
        {
            userService = userserv;
            passwordService = ps;
        }



        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetUsers()//все само конвертируется в формат json
        {
            var users = await userService.GetUsers();
            return Ok(users);
        }


        // GET: api/Users/3
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDTO>> GetUser(int id)
        {
            UserDTO user = await userService.GetUser((int)id);

            if (user == null)
            {
                return NotFound();
            }
            return new ObjectResult(user);

        }

        // PUT: api/Users
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
            user.Password = passwordService.HashPassword(user.Salt, user.Password);


            await userService.UpdateUser(user);
            return Ok(user);
        }



        // POST: api/Users
        [HttpPost]
        public async Task<ActionResult<UserDTO>> PostUser(UserDTO user)//заполняем без id
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            user.Salt = passwordService.GenerateSalt(); 
            user.Password = passwordService.HashPassword(user.Salt, user.Password);

            var created = await userService.CreateUser(user);
            return Ok(created);
          
        }

        // DELETE: api/Users/3
        [HttpDelete("{id}")]
        public async Task<ActionResult<UserDTO>> DeleteUser(int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            UserDTO user = await userService.GetUser((int)id);

            if (user == null)
            {
                return NotFound();
            }


            await userService.DeleteUser(id);

            return Ok(user);
        }
    }
}
