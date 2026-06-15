import { getCompanyById } from '../professional/professionalApi.js';
import { resolveUploadUrl } from '../../shared/api/uploads.js';

const companyCache = new Map();

function fallbackCompany(companyId) {
  return {
    id: companyId,
    name: 'Company',
    logo: '',
    logoUrl: '',
  };
}

export function clearCompanyCache() {
  companyCache.clear();
}

export async function getCachedCompany(companyId) {
  if (!companyId) return fallbackCompany(companyId);

  if (companyCache.has(companyId)) {
    return companyCache.get(companyId);
  }

  try {
    const company = await getCompanyById(companyId);
    const mapped = company
      ? {
          id: company.id,
          name: company.name ?? 'Company',
          logo: resolveUploadUrl(company.logoUrl),
          logoUrl: company.logoUrl ?? '',
        }
      : fallbackCompany(companyId);

    companyCache.set(companyId, mapped);
    return mapped;
  } catch {
    const fallback = fallbackCompany(companyId);
    companyCache.set(companyId, fallback);
    return fallback;
  }
}

export async function enrichVacanciesWithCompanies(vacancies = []) {
  if (!Array.isArray(vacancies) || vacancies.length === 0) {
    return [];
  }

  const companyIds = [
    ...new Set(
      vacancies
        .map((vacancy) => vacancy?.companyId ?? vacancy?.company?.id)
        .filter(Boolean),
    ),
  ];

  await Promise.all(companyIds.map((companyId) => getCachedCompany(companyId)));

  return vacancies.map((vacancy) => {
    const companyId = vacancy?.companyId ?? vacancy?.company?.id;
    const company = companyId
      ? companyCache.get(companyId) ?? fallbackCompany(companyId)
      : null;

    return {
      ...vacancy,
      company: company ?? vacancy.company ?? null,
      companyName: company?.name ?? vacancy.companyName ?? 'Company',
      companyLogo: company?.logo ?? vacancy.companyLogo ?? '',
    };
  });
}
