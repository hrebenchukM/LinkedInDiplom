using Jobs.Client.Contracts;
using Jobs.Client.Contracts.Resources;

namespace Jobs.Client;

public class JobsClient : IJobsClient
{
    public IVacancyResource Vacancies { get; }
    public IUserVacancyFavoriteResource Favorites { get; }
    public IJobApplicationResource Applications { get; }
    public IJobSearchQueryResource SearchQueries { get; }
    public IJobSearchResultResource SearchResults { get; }
    public IRecommendedJobQueryResource RecommendedQueries { get; }

    public JobsClient(
        IVacancyResource vacancies,
        IUserVacancyFavoriteResource favorites,
        IJobApplicationResource applications,
        IJobSearchQueryResource searchQueries,
        IJobSearchResultResource searchResults,
        IRecommendedJobQueryResource recommendedQueries)
    {
        Vacancies = vacancies;
        Favorites = favorites;
        Applications = applications;
        SearchQueries = searchQueries;
        SearchResults = searchResults;
        RecommendedQueries = recommendedQueries;
    }
}
