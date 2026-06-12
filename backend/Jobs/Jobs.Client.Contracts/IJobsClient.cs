using Jobs.Client.Contracts.Resources;

namespace Jobs.Client.Contracts;

public interface IJobsClient
{
    IVacancyResource Vacancies { get; }
    IUserVacancyFavoriteResource Favorites { get; }
    IJobApplicationResource Applications { get; }
    IJobSearchQueryResource SearchQueries { get; }
    IJobSearchResultResource SearchResults { get; }
    IRecommendedJobQueryResource RecommendedQueries { get; }
}
