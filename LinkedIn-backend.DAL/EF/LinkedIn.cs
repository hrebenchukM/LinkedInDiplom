//using Microsoft.EntityFrameworkCore;
//using LinkedIn_backend.DAL.Entities;

//namespace LinkedIn_backend.DAL.EF
//{
//    public class LinkedIn : DbContext
//    {


//        public DbSet<User> Users { get; set; }

//        public LinkedIn(DbContextOptions<LinkedIn> options)
//           : base(options)
//        {
//            if (Database.EnsureCreated())
//            {

//                string salt = "018035F9A34E797385FCF35335B9B18E";
//                string password = "4EC7CD4C352522EF9BA1FE7BE384FAD853D4E59E412DEAA644581C8D21630B0C";


//                User admin1 = new User { Login = "admin1@gmail.com", Password = password, Salt = salt, Role = "Admin" };
//                Users?.Add(admin1);



//                SaveChanges();
//            }
//        }


//    }
//}
