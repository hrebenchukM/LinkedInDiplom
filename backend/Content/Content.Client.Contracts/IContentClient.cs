using Content.Client.Contracts.Resources;

namespace Content.Client.Contracts;

// Внутренний клиент Content-модуля.
// По аналогии с Network.Client и Profile.Client.
public interface IContentClient
{
    IPostResource Posts { get; }

    IMediaResource Media { get; }

    IPostMediaResource PostMedia { get; }

    ICommentResource Comments { get; }

    IReactionResource Reactions { get; }

    IHashtagResource Hashtags { get; }

    IPostHashtagResource PostHashtags { get; }

    IUserHashtagFollowResource UserHashtagFollows { get; }

    ISavedPostResource SavedPosts { get; }

    IRepostResource Reposts { get; }

    IPostViewResource PostViews { get; }

    IMentionResource Mentions { get; }
}
