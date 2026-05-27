using Content.Client;
using Content.Client.Contracts;
using Content.Client.Contracts.Resources;
using Content.Client.Resources;
using Content.Contracts.Services;
using Content.DataAccess;
using Content.Services.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Content.DI;

// Подключение Content-модуля одной строкой в Program.cs
public static class ContentModuleServiceCollectionExtensions
{
    public static IServiceCollection AddContentModule(
        this IServiceCollection services,
        IConfiguration configuration,
        string connectionString)
    {
        services.AddDbContext<ContentDbContext>(options =>
            options.UseNpgsql(
                connectionString,
                npgsqlOptions => npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "content")));

        services.AddScoped<IPostService, PostService>();
        services.AddScoped<IMediaService, MediaService>();
        services.AddScoped<IPostMediaService, PostMediaService>();
        services.AddScoped<ICommentService, CommentService>();
        services.AddScoped<IReactionService, ReactionService>();
        services.AddScoped<IHashtagService, HashtagService>();
        services.AddScoped<IPostHashtagService, PostHashtagService>();
        services.AddScoped<IUserHashtagFollowService, UserHashtagFollowService>();
        services.AddScoped<ISavedPostService, SavedPostService>();
        services.AddScoped<IRepostService, RepostService>();
        services.AddScoped<IPostViewService, PostViewService>();
        services.AddScoped<IMentionService, MentionService>();

        services.AddScoped<IPostResource, PostResource>();
        services.AddScoped<IMediaResource, MediaResource>();
        services.AddScoped<IPostMediaResource, PostMediaResource>();
        services.AddScoped<ICommentResource, CommentResource>();
        services.AddScoped<IReactionResource, ReactionResource>();
        services.AddScoped<IHashtagResource, HashtagResource>();
        services.AddScoped<IPostHashtagResource, PostHashtagResource>();
        services.AddScoped<IUserHashtagFollowResource, UserHashtagFollowResource>();
        services.AddScoped<ISavedPostResource, SavedPostResource>();
        services.AddScoped<IRepostResource, RepostResource>();
        services.AddScoped<IPostViewResource, PostViewResource>();
        services.AddScoped<IMentionResource, MentionResource>();

        services.AddScoped<IContentClient, ContentClient>();

        return services;
    }
}
