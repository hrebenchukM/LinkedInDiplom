using Messaging.Client;
using Messaging.Client.Contracts;
using Messaging.Client.Contracts.Resources;
using Messaging.Client.Resources;
using Messaging.Contracts.Services;
using Messaging.DataAccess;
using Messaging.Services.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Messaging.DI;

public static class MessagingModuleServiceCollectionExtensions
{
    public static IServiceCollection AddMessagingModule(
        this IServiceCollection services,
        IConfiguration configuration,
        string connectionString)
    {
        services.AddDbContext<MessagingDbContext>(options =>
            options.UseNpgsql(
                connectionString,
                npgsqlOptions => npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "messaging")));

        services.AddScoped<IChatService, ChatService>();
        services.AddScoped<IChatMemberService, ChatMemberService>();
        services.AddScoped<IMessageService, MessageService>();
        services.AddScoped<IMessageReadService, MessageReadService>();
        services.AddScoped<IMessageMediaService, MessageMediaService>();

        services.AddScoped<IChatResource, ChatResource>();
        services.AddScoped<IChatMemberResource, ChatMemberResource>();
        services.AddScoped<IMessageResource, MessageResource>();
        services.AddScoped<IMessageReadResource, MessageReadResource>();
        services.AddScoped<IMessageMediaResource, MessageMediaResource>();

        services.AddScoped<IMessagingClient, MessagingClient>();

        return services;
    }
}
