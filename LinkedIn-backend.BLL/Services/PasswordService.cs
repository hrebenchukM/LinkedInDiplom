//using System.Security.Cryptography;
//using System.Text;
//using LinkedIn_backend.BLL.DTO;
//using LinkedIn_backend.DAL.Entities;
//using LinkedIn_backend.DAL.Interfaces;
//using LinkedIn_backend.BLL.Infrastructure;
//using LinkedIn_backend.BLL.Interfaces;


//namespace LinkedIn_backend.BLL.Services
//{
//    public class PasswordService : IPassword
//    {
//        public string GenerateSalt()
//        {
//            byte[] saltbuf = new byte[16];
//            RandomNumberGenerator randomNumberGenerator = RandomNumberGenerator.Create();
//            randomNumberGenerator.GetBytes(saltbuf);
//            StringBuilder sb = new StringBuilder(16);
//            for (int i = 0; i < 16; i++)
//                sb.Append(string.Format("{0:X2}", saltbuf[i]));
//            return sb.ToString();
//        }
//        public string HashPassword(string salt, string password)
//        {
//            byte[] passwordb = Encoding.Unicode.GetBytes(salt + password);

//            byte[] byteHash = SHA256.HashData(passwordb);

//            StringBuilder hash = new StringBuilder(byteHash.Length);
//            for (int i = 0; i < byteHash.Length; i++)
//                hash.Append(string.Format("{0:X2}", byteHash[i]));
//            return hash.ToString();
//        }
//    }
//}
