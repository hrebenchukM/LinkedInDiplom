using Content.Client.Contracts;
using Content.Client.Contracts.Resources;

namespace Content.Client;

// Внутренний клиент Content-модуля.
// Отдаёт доступ к Content resources.
public class ContentClient : IContentClient
{
    public IPostResource Posts { get; }

    public IMediaResource Media { get; }

    public IPostMediaResource PostMedia { get; }

    public ICommentResource Comments { get; }

    public IReactionResource Reactions { get; }

    public IHashtagResource Hashtags { get; }

    public IPostHashtagResource PostHashtags { get; }

    public IUserHashtagFollowResource UserHashtagFollows { get; }

    public ContentClient(
        IPostResource posts,
        IMediaResource media,
        IPostMediaResource postMedia,
        ICommentResource comments,
        IReactionResource reactions,
        IHashtagResource hashtags,
        IPostHashtagResource postHashtags,
        IUserHashtagFollowResource userHashtagFollows)
    {
        Posts = posts;
        Media = media;
        PostMedia = postMedia;
        Comments = comments;
        Reactions = reactions;
        Hashtags = hashtags;
        PostHashtags = postHashtags;
        UserHashtagFollows = userHashtagFollows;
    }
}
