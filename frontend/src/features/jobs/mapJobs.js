import { mapVacancySortBy, normalizeSortDirection } from '../../shared/api/sortParams.js';
import { mapPagedResponse } from '../../shared/lib/pagination.js';

/** Lowercase string id for Set/Map lookups (GUID-safe). Empty if id is missing. */
export function normalizeVacancyId(id) {
  if (id == null || id === '') return '';
  return String(id).toLowerCase();
}

/** True when the vacancy was posted by the current user. */
export function isOwnVacancy(vacancy, currentUserId) {
  if (!vacancy || !currentUserId) return false;

  const normUser = normalizeVacancyId(currentUserId);
  if (!normUser) return false;

  const ownerCandidates = [
    vacancy.postedBy,
    vacancy.postedByUserId,
    vacancy.createdByUserId,
    vacancy.ownerUserId,
    vacancy.recruiterUserId,
    vacancy.userId,
    vacancy.postedBy?.id,
    vacancy.postedBy?.userId,
  ];

  return ownerCandidates.some(
    (candidate) =>
      candidate != null
      && candidate !== ''
      && normalizeVacancyId(candidate) === normUser,
  );
}

function metaSetHas(set, rawId) {
  const normalized = normalizeVacancyId(rawId);
  if (!normalized || !set) return false;
  return set.has(normalized);
}

function pick(dto, ...keys) {
  if (!dto) return null;
  for (const key of keys) {
    const value = dto[key];
    if (value != null && value !== '') return value;
  }
  return null;
}

function normalizeTextList(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter(Boolean).map(String);
  }
  if (typeof value === 'string') {
    return value
      .split(/\n|•|;/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function formatSalary(salaryFrom, salaryTo, currency) {
  const from = salaryFrom != null ? Number(salaryFrom) : null;
  const to = salaryTo != null ? Number(salaryTo) : null;
  const curr = currency ? ` ${currency}` : '';

  if (from != null && to != null) {
    return `${from.toLocaleString()} – ${to.toLocaleString()}${curr}`.trim();
  }
  if (from != null) {
    return `from ${from.toLocaleString()}${curr}`.trim();
  }
  if (to != null) {
    return `up to ${to.toLocaleString()}${curr}`.trim();
  }
  return 'Salary not specified';
}

export function mapVacancyDto(dto, meta = {}) {
  if (!dto) return null;

  const id = pick(dto, 'id', 'Id');
  const companyId = pick(dto, 'companyId', 'CompanyId');
  const salaryFrom = pick(dto, 'salaryFrom', 'SalaryFrom');
  const salaryTo = pick(dto, 'salaryTo', 'SalaryTo');
  const currency = pick(dto, 'salaryCurrency', 'SalaryCurrency', 'currency', 'Currency');
  const jobType = pick(dto, 'jobType', 'JobType');
  const schedule = pick(dto, 'schedule', 'Schedule');
  const description = pick(dto, 'description', 'Description');
  const createdAt = pick(dto, 'postedAt', 'PostedAt', 'createdAt', 'CreatedAt');
  const company = meta.company ?? null;

  return {
    id,
    companyId,
    title: pick(dto, 'title', 'Title') ?? '',
    company: company ?? (companyId
      ? {
          id: companyId,
          name: meta.companyName ?? 'Company',
          logo: meta.companyLogo ?? '',
        }
      : null),
    companyName: company?.name ?? meta.companyName ?? 'Company',
    companyLogo: company?.logo ?? meta.companyLogo ?? '',
    location: pick(dto, 'location', 'Location') ?? '',
    salary: formatSalary(salaryFrom, salaryTo, currency),
    salaryFrom,
    salaryTo,
    currency,
    employmentType: jobType ?? '',
    jobType: jobType ?? '',
    schedule: schedule ?? '',
    experienceLevel: pick(dto, 'experienceLevel', 'ExperienceLevel') ?? '',
    description,
    requirements: normalizeTextList(pick(dto, 'requirements', 'Requirements')),
    createdAt,
    postedAt: createdAt,
    updatedAt: pick(dto, 'updatedAt', 'UpdatedAt'),
    deletedAt: pick(dto, 'deletedAt', 'DeletedAt'),
    postedBy: pick(dto, 'postedBy', 'PostedBy'),
    isFavorite: Boolean(meta.isFavorite),
    hasApplied: Boolean(meta.hasApplied),
  };
}

export function mapVacancyListResponse(response, meta = {}) {
  const paged = mapPagedResponse(response);
  return {
    ...paged,
    items: paged.items
      .map((item) => {
        const vacancyId = pick(item, 'id', 'Id');
        return mapVacancyDto(item, {
          isFavorite: metaSetHas(meta.favoriteIds, vacancyId),
          hasApplied: metaSetHas(meta.appliedIds, vacancyId),
        });
      })
      .filter(Boolean),
  };
}

const JOB_TYPE_MAP = {
  'Full-time': 'Full time',
  'Part-time': 'Part time',
  'Full time': 'Full time',
  'Part time': 'Part time',
};

export function mapVacancyToCreateRequest(formState) {
  const jobType = formState.employmentType
    ?? formState.jobType
    ?? JOB_TYPE_MAP[formState.jobType]
    ?? formState.jobType
    ?? null;

  return {
    companyId: formState.companyId,
    title: formState.title?.trim() ?? '',
    description: formState.description?.trim() || null,
    location: formState.location?.trim() || null,
    jobType: jobType || null,
    schedule: formState.schedule ?? formState.workplaceType ?? null,
    salaryFrom: formState.salaryFrom != null && formState.salaryFrom !== ''
      ? Number(formState.salaryFrom)
      : null,
    salaryTo: formState.salaryTo != null && formState.salaryTo !== ''
      ? Number(formState.salaryTo)
      : null,
    salaryCurrency: formState.currency?.trim() || formState.salaryCurrency?.trim() || null,
  };
}

export function mapVacancyToUpdateRequest(formState) {
  return mapVacancyToCreateRequest(formState);
}

export function mapApplicationDto(dto) {
  if (!dto) return null;

  const vacancy = pick(dto, 'vacancy', 'Vacancy');

  return {
    id: pick(dto, 'id', 'Id'),
    vacancyId: pick(dto, 'vacancyId', 'VacancyId'),
    userId: pick(dto, 'userId', 'UserId'),
    status: pick(dto, 'status', 'Status') ?? '',
    appliedAt: pick(dto, 'appliedAt', 'AppliedAt'),
    statusChangedAt: pick(dto, 'statusChangedAt', 'StatusChangedAt'),
    withdrawnAt: pick(dto, 'withdrawnAt', 'WithdrawnAt'),
    vacancy: vacancy ? mapVacancyDto(vacancy) : null,
  };
}

export function mapApplicationList(response) {
  const items = Array.isArray(response)
    ? response
    : Array.isArray(response?.items)
      ? response.items
      : [];

  return items.map(mapApplicationDto).filter(Boolean);
}

export function mapFavoriteDto(dto) {
  if (!dto) return null;

  const vacancy = pick(dto, 'vacancy', 'Vacancy');
  const vacancyId = pick(dto, 'vacancyId', 'VacancyId');

  return {
    id: pick(dto, 'id', 'Id'),
    userId: pick(dto, 'userId', 'UserId'),
    vacancyId,
    createdAt: pick(dto, 'createdAt', 'CreatedAt'),
    vacancy: vacancy ? mapVacancyDto(vacancy, { isFavorite: true }) : null,
  };
}

export function mapFavoriteList(response) {
  const items = Array.isArray(response)
    ? response
    : Array.isArray(response?.items)
      ? response.items
      : [];

  return items.map(mapFavoriteDto).filter(Boolean);
}

export function mapRecommendedQueryDto(dto) {
  if (!dto) return null;

  return {
    id: pick(dto, 'id', 'Id'),
    query: pick(dto, 'query', 'Query') ?? '',
    createdAt: pick(dto, 'createdAt', 'CreatedAt'),
  };
}

export function mapRecommendedQueryList(response) {
  const items = Array.isArray(response)
    ? response
    : Array.isArray(response?.items)
      ? response.items
      : [];

  return items.map(mapRecommendedQueryDto).filter(Boolean);
}

export function mapFiltersToVacancyQuery(filters = {}, searchQuery = '') {
  const query = {};

  const text = (searchQuery ?? filters.query ?? filters.search ?? '').trim();
  if (text) {
    query.query = text;
  }

  if (filters.locationText?.trim()) {
    query.location = filters.locationText.trim();
  } else if (typeof filters.location === 'string' && filters.location.trim()) {
    query.location = filters.location.trim();
  }

  const employmentTypes = filters.employmentType ?? filters.jobType ?? [];
  if (Array.isArray(employmentTypes) && employmentTypes.length === 1) {
    query.employmentType = employmentTypes[0].replace('-', ' ');
  } else if (typeof employmentTypes === 'string' && employmentTypes) {
    query.employmentType = employmentTypes.replace('-', ' ');
  }

  const schedules = filters.schedule ?? filters.location ?? [];
  if (Array.isArray(schedules) && schedules.length === 1) {
    const value = schedules[0];
    if (['Remote', 'On-site', 'Hybrid'].includes(value)) {
      query.schedule = value;
    }
  } else if (typeof filters.schedule === 'string' && filters.schedule) {
    query.schedule = filters.schedule;
  }

  const mappedSortBy = mapVacancySortBy(filters.sortBy);
  if (mappedSortBy) {
    query.sortBy = mappedSortBy;
    const mappedDirection = normalizeSortDirection(filters.sortDirection);
    if (mappedDirection) {
      query.sortDirection = mappedDirection;
    }
  }

  return query;
}

const SKILL_SEARCH_ALIASES = {
  java: ['java'],
  postgresql: ['postgresql', 'postgres', 'sql'],
  postgres: ['postgresql', 'postgres', 'sql'],
  sql: ['sql', 'postgresql', 'postgres'],
  javascript: ['javascript', 'typescript', 'react', 'frontend'],
  typescript: ['typescript', 'javascript', 'react', 'frontend'],
  react: ['react', 'frontend'],
  python: ['python'],
  'c#': ['c#', '.net', 'dotnet'],
  '.net': ['.net', 'dotnet', 'c#'],
};

function getSkillSearchTerms(skillName) {
  const normalized = String(skillName ?? '').trim().toLowerCase();
  if (!normalized) return [];
  return SKILL_SEARCH_ALIASES[normalized] ?? [normalized];
}

function vacancyMatchesSkill(vacancy, skillName) {
  const haystack = `${vacancy.title ?? ''} ${vacancy.description ?? ''}`.toLowerCase();
  return getSkillSearchTerms(skillName).some((term) => haystack.includes(term));
}

function scoreVacancyForProfile(vacancy, skillNames, profileTitle) {
  let score = 0;

  for (const skill of skillNames) {
    if (vacancyMatchesSkill(vacancy, skill)) {
      score += 10;
    }
  }

  if (profileTitle) {
    const titleWords = profileTitle.toLowerCase().split(/\W+/).filter((word) => word.length > 2);
    const vacancyTitle = (vacancy.title ?? '').toLowerCase();
    for (const word of titleWords) {
      if (vacancyTitle.includes(word)) {
        score += 5;
      }
    }
  }

  return score;
}

export function recommendVacanciesForProfile(
  vacancies,
  { skillNames = [], profileTitle = '' } = {},
  limit = 5,
) {
  if (!Array.isArray(vacancies) || vacancies.length === 0) return [];

  const normalizedSkills = skillNames.filter(Boolean);

  const scored = vacancies
    .map((vacancy) => ({
      vacancy,
      score: scoreVacancyForProfile(vacancy, normalizedSkills, profileTitle),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length > 0) {
    return scored.slice(0, limit).map(({ vacancy }) => vacancy);
  }

  return vacancies.slice(0, limit);
}

export function vacancyMatchesProfileSkills(vacancy, skillNames = []) {
  return skillNames.some((skill) => vacancyMatchesSkill(vacancy, skill));
}

export function applyClientSideVacancyFilters(vacancies, filters) {
  if (!filters || !Array.isArray(vacancies)) return vacancies;

  return vacancies.filter((vacancy) => {
    const locationFilters = Array.isArray(filters.location)
      ? filters.location.filter((item) => ['Remote', 'On-site', 'Hybrid'].includes(item))
      : [];

    if (locationFilters.length > 1) {
      const schedule = vacancy.schedule?.toLowerCase() ?? '';
      const loc = vacancy.location?.toLowerCase() ?? '';
      const matches = locationFilters.some((filterValue) => {
        if (filterValue === 'Remote') {
          return schedule.includes('remote') || loc.includes('remote');
        }
        if (filterValue === 'On-site') {
          return schedule.includes('on-site') || schedule.includes('onsite')
            || (!loc.includes('remote') && !schedule.includes('remote'));
        }
        if (filterValue === 'Hybrid') {
          return schedule.includes('hybrid') || loc.includes('hybrid');
        }
        return false;
      });
      if (!matches) return false;
    }

    const jobTypes = filters.jobType ?? filters.employmentType ?? [];
    if (Array.isArray(jobTypes) && jobTypes.length > 0 && vacancy.employmentType) {
      const normalized = jobTypes.map((item) => item.replace('-', ' ').toLowerCase());
      if (!normalized.includes(vacancy.employmentType.replace('-', ' ').toLowerCase())) {
        return false;
      }
    }

    const experienceLevels = filters.experienceLevel ?? [];
    if (experienceLevels.length > 0 && vacancy.experienceLevel) {
      if (!experienceLevels.includes(vacancy.experienceLevel)) return false;
    }

    const salaryRange = filters.salaryRange;
    if (Array.isArray(salaryRange) && salaryRange.length === 2) {
      const [min, max] = salaryRange;
      if (vacancy.salaryFrom != null && vacancy.salaryTo != null) {
        if (Number(vacancy.salaryTo) < min || Number(vacancy.salaryFrom) > max) {
          return false;
        }
      }
    }

    return true;
  });
}
