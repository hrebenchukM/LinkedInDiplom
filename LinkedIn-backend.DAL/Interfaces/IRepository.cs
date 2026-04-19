namespace LinkedIn_backend.DAL.Interfaces
{
    public interface IRepository<T> where T : class
    {
        Task<List<T>> GetList();
        Task<T?> Get(int id);
        Task Create(T item);
        void Update(T item);
        Task Delete(int id);
    }
}