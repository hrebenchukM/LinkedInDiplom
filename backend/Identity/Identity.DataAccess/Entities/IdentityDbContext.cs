using System.Security.Principal;
using Identity.DataAccess.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Identity.DataAccess;
//2. Где хранить пользователей (DbContext) = менеджер работы с БД
public class IdentityDbContext : IdentityDbContext<ApplicationUser>//“моя база работает с ApplicationUser”
{
    public DbSet<RefreshToken> RefreshTokens { get; set; } = default!;//таблица RefreshTokens

    public IdentityDbContext(DbContextOptions<IdentityDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.HasDefaultSchema("identity");//таблицы будут:identity.Users+identity.RefreshTokens

        builder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Token)
                .IsRequired()
                .HasMaxLength(500);//токен обязателен и максимум 500 символов

            entity.Property(e => e.UserId)
                .IsRequired();

            entity.HasIndex(e => e.Token)
                .IsUnique();//один токен = уникальный

            //1 пользователь → много токенов
            entity.HasOne(e => e.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(e => e.UserId)//поле UserId — это связь
                .OnDelete(DeleteBehavior.Cascade);//если удалить пользователя → удалить токены
        });
    }
}