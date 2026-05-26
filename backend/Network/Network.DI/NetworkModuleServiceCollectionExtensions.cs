using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Network.Client;
using Network.Client.Contracts;
using Network.Client.Contracts.Resources;
using Network.Client.Resources;
using Network.Contracts.Services;
using Network.DataAccess;
using Network.Services.Services;

namespace Network.DI;

// Подключение Network-модуля одной строкой в Program.cs
public static class NetworkModuleServiceCollectionExtensions
{
    public static IServiceCollection AddNetworkModule(
        this IServiceCollection services,
        IConfiguration configuration,
        string connectionString)
    {
        services.AddDbContext<NetworkDbContext>(options =>
            options.UseNpgsql(
                connectionString,
                npgsqlOptions => npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "network")));

        services.AddScoped<IContactService, ContactService>();
        services.AddScoped<IFollowService, FollowService>();
        services.AddScoped<IBlockedUserService, BlockedUserService>();
        services.AddScoped<IUserGroupService, UserGroupService>();
        services.AddScoped<IGroupMemberService, GroupMemberService>();

        services.AddScoped<IContactResource, ContactResource>();
        services.AddScoped<IFollowResource, FollowResource>();
        services.AddScoped<IBlockedUserResource, BlockedUserResource>();
        services.AddScoped<IUserGroupResource, UserGroupResource>();
        services.AddScoped<IGroupMemberResource, GroupMemberResource>();

        services.AddScoped<INetworkClient, NetworkClient>();

        return services;
    }
}
