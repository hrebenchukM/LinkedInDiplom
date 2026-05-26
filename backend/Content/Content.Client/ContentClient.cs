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

    public ContentClient(
        IPostResource posts,
        IMediaResource media,
        IPostMediaResource postMedia)
    {
        Posts = posts;
        Media = media;
        PostMedia = postMedia;
    }
}
