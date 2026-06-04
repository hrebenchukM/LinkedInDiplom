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
            npgsqlOptions => npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "identity"));//говорим:используй PostgreSQL//таблицу истории миграций храни в схеме identity.
        //EF хранит там список уже применённых миграций Чтобы не применять одну и ту же миграцию два раза.

        return new IdentityDbContext(optionsBuilder.Options);// возвращаем готовый DbContext
    }
}
//IdentityDbContextFactory = запасной способ создать IdentityDbContext для миграций


//В обычной работе приложения этот класс почти не участвует.

//Когда  запускаешь API через Swagger — обычно работает Program.cs.

//Когда  создаёшь миграции через терминал — помогает IdentityDbContextFactory.