import { resolveUploadUrl } from '../../shared/api/uploads.js';

function pick(dto, ...keys) {
  if (!dto) return null;
  for (const key of keys) {
    const value = dto[key];
    if (value != null && value !== '') return value;
  }
  return null;
}

export function formatDateOnly(value) {
  if (!value) return null;
  if (typeof value === 'string') return value.slice(0, 10);
  return String(value);
}

export function formatPeriod(startDate, endDate, isCurrent = false) {
  const start = formatDateOnly(startDate);
  const end = isCurrent || !endDate ? 'Present' : formatDateOnly(endDate);
  if (!start) return end === 'Present' ? 'Present' : '';
  return `${start} – ${end}`;
}

export function mapExperienceDto(dto, companyName = null) {
  if (!dto) return null;

  const experience = {
    id: pick(dto, 'id', 'Id'),
    position: pick(dto, 'position', 'Position') ?? '',
    employmentType: pick(dto, 'employmentType', 'EmploymentType') ?? 'Full-time',
    workLocationType: pick(dto, 'workLocationType', 'WorkLocationType'),
    location: pick(dto, 'location', 'Location'),
    startDate: formatDateOnly(pick(dto, 'startDate', 'StartDate')),
    endDate: formatDateOnly(pick(dto, 'endDate', 'EndDate')),
    description: pick(dto, 'description', 'Description'),
    companyId: pick(dto, 'companyId', 'CompanyId'),
  };

  return {
    experience,
    company: companyName || experience.companyId
      ? {
          name: companyName ?? 'Company',
          logoUrl: null,
        }
      : null,
  };
}

export function mapExperienceList(items = [], companyNames = {}) {
  return (Array.isArray(items) ? items : []).map((item) =>
    mapExperienceDto(item, companyNames[item.id] ?? companyNames[item.Id]),
  );
}

export function mapEducationDto(dto) {
  if (!dto) return null;

  return {
    education: {
      id: pick(dto, 'id', 'Id'),
      institution: pick(dto, 'institution', 'Institution') ?? '',
      degree: pick(dto, 'degree', 'Degree'),
      fieldOfStudy: pick(dto, 'fieldOfStudy', 'FieldOfStudy'),
      startDate: formatDateOnly(pick(dto, 'startDate', 'StartDate')),
      endDate: formatDateOnly(pick(dto, 'endDate', 'EndDate')),
      source: pick(dto, 'source', 'Source'),
    },
    academy: pick(dto, 'academyId', 'AcademyId')
      ? { name: null, logoUrl: null }
      : null,
  };
}

export function mapEducationList(items = []) {
  return (Array.isArray(items) ? items : []).map(mapEducationDto).filter(Boolean);
}

export function mapCertificateDto(dto, academyName = null) {
  if (!dto) return null;

  return {
    certificate: {
      id: pick(dto, 'id', 'Id'),
      name: pick(dto, 'name', 'Name') ?? '',
      issueDate: formatDateOnly(pick(dto, 'issueDate', 'IssueDate')),
      expiryDate: formatDateOnly(pick(dto, 'expiryDate', 'ExpiryDate')),
      downloadRef: pick(dto, 'downloadRef', 'DownloadRef'),
      accreditationId: pick(dto, 'accreditationId', 'AccreditationId'),
      organizationUrl: pick(dto, 'organizationUrl', 'OrganizationUrl'),
    },
    academy: academyName ? { name: academyName, logoUrl: null } : null,
  };
}

export function mapCertificateList(items = [], academyNames = {}) {
  return (Array.isArray(items) ? items : []).map((item) =>
    mapCertificateDto(item, academyNames[item.id] ?? academyNames[item.Id]),
  );
}

export function mapSkillDto(dto) {
  if (!dto) return null;
  return {
    id: pick(dto, 'id', 'Id'),
    name: pick(dto, 'name', 'Name') ?? '',
    description: pick(dto, 'description', 'Description'),
  };
}

export function mapUserSkillDto(dto, skillCatalogItem = null) {
  if (!dto) return null;

  const skillId = pick(dto, 'skillId', 'SkillId');
  const skill = skillCatalogItem
    ? mapSkillDto(skillCatalogItem)
    : { id: skillId, name: pick(dto, 'skillName', 'SkillName') ?? 'Skill' };

  return {
    id: pick(dto, 'id', 'Id'),
    skillId,
    level: pick(dto, 'level', 'Level'),
    isMain: Boolean(pick(dto, 'isMain', 'IsMain')),
    orderIndex: pick(dto, 'orderIndex', 'OrderIndex') ?? 0,
    skill,
  };
}

export function mapUserSkillList(items = [], skillMap = {}) {
  return (Array.isArray(items) ? items : []).map((item) => {
    const skillId = pick(item, 'skillId', 'SkillId');
    return mapUserSkillDto(item, skillMap[skillId]);
  });
}

export function mapLanguageDto(dto) {
  if (!dto) return null;
  return {
    id: pick(dto, 'id', 'Id'),
    name: pick(dto, 'name', 'Name') ?? '',
  };
}

export function mapUserLanguageDto(dto, languageCatalogItem = null) {
  if (!dto) return null;

  const languageId = pick(dto, 'languageId', 'LanguageId');
  const language = languageCatalogItem
    ? mapLanguageDto(languageCatalogItem)
    : { id: languageId, name: pick(dto, 'languageName', 'LanguageName') ?? 'Language' };

  return {
    id: pick(dto, 'id', 'Id'),
    languageId,
    level: pick(dto, 'level', 'Level'),
    language,
  };
}

export function mapUserLanguageList(items = [], languageMap = {}) {
  return (Array.isArray(items) ? items : []).map((item) => {
    const languageId = pick(item, 'languageId', 'LanguageId');
    return mapUserLanguageDto(item, languageMap[languageId]);
  });
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toIsoDate(monthName, year) {
  if (!monthName || !year) return null;
  const monthIndex = MONTHS.indexOf(monthName);
  if (monthIndex < 0) return null;
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`;
}

export function mapExperienceToRequest(formData) {
  return {
    position: formData.title ?? formData.position,
    location: formData.location || null,
    employmentType: formData.employmentType || 'Full-time',
    workLocationType: formData.workLocationType || 'On-site',
    description: formData.description || null,
    startDate: toIsoDate(formData.startMonth, formData.startYear),
    endDate: formData.current
      ? null
      : toIsoDate(formData.endMonth, formData.endYear),
  };
}

export function mapEducationToRequest(formData) {
  return {
    institution: formData.school ?? formData.institution,
    degree: formData.degree || null,
    fieldOfStudy: (formData.field ?? formData.fieldOfStudy) || null,
    startDate: toIsoDate(formData.startMonth, formData.startYear),
    endDate: formData.current
      ? null
      : toIsoDate(formData.endMonth, formData.endYear),
  };
}

export function mapSkillToRequest(formData, skillId) {
  return {
    skillId,
    level: formData.level || null,
    isMain: Boolean(formData.isMain),
    orderIndex: Number(formData.orderIndex ?? 0),
  };
}

export function mapCertificateToRequest(formData) {
  return {
    name: formData.name,
    issueDate: toIsoDate(formData.issueMonth, formData.issueYear),
    expiryDate: toIsoDate(formData.expiryMonth, formData.expiryYear),
    accreditationId: formData.accreditationId || null,
    organizationUrl: formData.organizationUrl || null,
  };
}

export function mapLanguageToRequest(formData, languageId) {
  return {
    languageId,
    level: formData.level || null,
  };
}

export function unwrapList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.Items)) return response.Items;
  return [];
}

export function mapCompanyDto(dto) {
  if (!dto) return null;

  return {
    id: pick(dto, 'id', 'Id'),
    ownerUserId: pick(dto, 'ownerUserId', 'OwnerUserId'),
    name: pick(dto, 'name', 'Name') ?? 'Company',
    logoUrl: pick(dto, 'logoUrl', 'LogoUrl') ?? '',
    logo: resolveUploadUrl(pick(dto, 'logoUrl', 'LogoUrl') ?? ''),
    industry: pick(dto, 'industry', 'Industry'),
    location: pick(dto, 'location', 'Location'),
    websiteUrl: pick(dto, 'websiteUrl', 'WebsiteUrl'),
    description: pick(dto, 'description', 'Description'),
    createdAt: pick(dto, 'createdAt', 'CreatedAt'),
    updatedAt: pick(dto, 'updatedAt', 'UpdatedAt'),
  };
}

export function mapCompanyList(items = []) {
  return (Array.isArray(items) ? items : []).map(mapCompanyDto).filter(Boolean);
}
