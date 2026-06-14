import { apiClient } from "../../shared/api/client";
import { AI } from "../../shared/api/paths";
import { USE_MOCK_AUTH } from "../../shared/config/features";
import { mapJobRecommendationToCard, normalizeJobRecommendationDto } from "./mapAi";

function unwrapRecommendedJobsResponse(data) {
  if (data?.success === false) {
    const message =
      (Array.isArray(data?.errors) && data.errors[0]) ||
      data?.error ||
      data?.message ||
      "Recommended jobs request failed.";
    throw new Error(String(message));
  }
  const list = data?.recommendations ?? data?.Recommendations ?? [];
  return Array.isArray(list) ? list : [];
}

/** `GET /api/ai/recommended-jobs` */
export async function fetchRecommendedJobs() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(AI.recommendedJobs);
  return unwrapRecommendedJobsResponse(data)
    .map(normalizeJobRecommendationDto)
    .filter(Boolean)
    .map(mapJobRecommendationToCard)
    .filter(Boolean);
}
