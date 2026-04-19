using Microsoft.EntityFrameworkCore;
using LinkedIn_backend.DAL.Entities;
using LinkedIn_backend.DAL.Interfaces;
using LinkedIn_backend.DAL.EF;

namespace LinkedIn_backend.DAL.Repositories
{
    public class UserRepository : IUserRepository
    {
        private LinkedInContext db;

        public UserRepository(LinkedInContext context)
        {
            this.db = context;
        }

        public async Task<List<User>> GetList()
        {
            return await db.Users.ToListAsync();
        }

        public async Task<User?> Get(int id)
        {
            User? user = await db.Users.FindAsync(id);
            return user;
        }

        public async Task<User?> Get(string login)
        {
            var users = await db.Users.Where(a => a.Login == login).ToListAsync();
            User? user = users.FirstOrDefault();
            return user;
        }

        public async Task Create(User user)
        {
            await db.Users.AddAsync(user);
        }

        public void Update(User user)
        {
            db.Entry(user).State = EntityState.Modified;
        }

        public async Task Delete(int id)
        {
            User? user = await db.Users.FindAsync(id);
            if (user != null)
                db.Users.Remove(user);
        }

        public async Task<bool> AnyUsers()
        {
            return await db.Users.AnyAsync();
        }

        public async Task<User?> GetUserByLogin(string login)
        {
            return await db.Users.FirstOrDefaultAsync(x => x.Login == login);
        }

        public async Task ChangeActiveStatus(int id)
        {
            User? user = await db.Users.FindAsync(id);
            if (user != null)
            {
                await Task.CompletedTask;
            }
        }

        public async Task<List<User>> GetInactiveUsers()
        {
            return await Task.FromResult(new List<User>());
        }
    }
}