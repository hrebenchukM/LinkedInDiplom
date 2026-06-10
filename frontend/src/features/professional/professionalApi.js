import { apiClient } from "../../shared/api/client";
import { PROFESSIONAL } from "../../shared/api/paths";
import { USE_MOCK_AUTH } from "../../shared/config/features";

export async function fetchMyExperiences() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(PROFESSIONAL.myExperiences);
  return Array.isArray(data) ? data : [];
}

export async function fetchCompanyById(companyId) {
  if (USE_MOCK_AUTH || !companyId) return null;
  try {
    return await apiClient.get(PROFESSIONAL.company(companyId));
  } catch {
    return null;
  }
}

export async function fetchCompaniesByIds(companyIds = []) {
  const unique = [...new Set(companyIds.filter(Boolean).map(String))];
  const entries = await Promise.all(unique.map(async (id) => [id, await fetchCompanyById(id)]));
  return Object.fromEntries(entries);
}

export function mapExperienceDtoToHistoryItem(dto, companyName = "") {
  const start = dto.startDate ? String(dto.startDate).slice(0, 10) : "";
  const end = dto.endDate ? String(dto.endDate).slice(0, 10) : "Present";
  const title = companyName ? `${dto.position} — ${companyName}` : dto.position;
  return {
    title,
    meta: `${start} - ${end}${dto.location ? ` · ${dto.location}` : ""}`,
    _api: true,
  };
}
