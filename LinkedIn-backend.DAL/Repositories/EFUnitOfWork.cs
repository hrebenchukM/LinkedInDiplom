//using LinkedIn_backend.DAL.EF;
//using LinkedIn_backend.DAL.Interfaces;
//using LinkedIn_backend.DAL.Entities;

//namespace LinkedIn_backend.DAL.Repositories
//{
//    /*
//     * Паттерн Unit of Work позволяет упростить работу с различными репозиториями и дает уверенность, 
//     * что все репозитории будут использовать один и тот же контекст данных.
//    */

//    public class EFUnitOfWork : IUnitOfWork
//    {
//        private LinkedInContext db;
//        private UserRepository userRepository;

//        public EFUnitOfWork(LinkedInContext context)
//        {
//            db = context;
//        }


//        public IUserRepository Users
//        {
//            get
//            {
//                if (userRepository == null)
//                    userRepository = new UserRepository(db);
//                return userRepository;
//            }
//        }


//        public async Task Save()
//        {
//            await db.SaveChangesAsync();
//        }

//    }
//}