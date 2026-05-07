using Identity.DataAccess;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

//Это нужно ТОЛЬКО для миграций.
//Когда ты пишешь:
//dotnet ef migrations add Init
//EF должен создать DbContext.
//Но:
//Program.cs ещё не запущен
//он не знает как создать DbContext
//namespace Identity.DataAccess;
//4. Как EF создаёт БД(Factory)
public class IdentityDbContextFactory : IDesignTimeDbContextFactory<IdentityDbContext>//“я умею создавать DbContext вручную”
{
    public IdentityDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<IdentityDbContext>();//создаём настройки

        optionsBuilder.UseNpgsql(
            "Host=localhost;Port=5432;Database=linkedin_dev;Username=postgres;Password=postgres",
            npgsqlOptions => npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "identity"));//говорим:используй PostgreSQL

        return new IdentityDbContext(optionsBuilder.Options);// возвращаем готовый DbContext
    }
}