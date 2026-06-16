import apiClient from '../../shared/api/client.js';
import { API_PATHS } from '../../shared/api/paths.js';
import { mapJobRecommendationToCard, normalizeJobRecommendationDto } from './mapAi.js';

function unwrapRecommendedJobsResponse(data) {
  if (data?.success === false) {
    const message =
      (Array.isArray(data?.errors) && data.errors[0]) ||
      data?.error ||
      data?.message ||
      'Recommended jobs request failed.';
    throw new Error(String(message));
  }
  const list = data?.recommendations ?? data?.Recommendations ?? [];
  return Array.isArray(list) ? list : [];
}

/** GET /api/ai/recommended-jobs */
export async function fetchRecommendedJobs() {
  const data = await apiClient.get(API_PATHS.ai.recommendedJobs);
  return unwrapRecommendedJobsResponse(data)
    .map(normalizeJobRecommendationDto)
    .filter(Boolean)
    .map(mapJobRecommendationToCard)
    .filter(Boolean);
}
