export function pickPrimaryCompany(companies = []) {
  if (!Array.isArray(companies) || companies.length === 0) return null;
  return [...companies].sort(
    (a, b) =>
      Date.parse(String(b.updatedAt || b.createdAt || 0)) -
      Date.parse(String(a.updatedAt || a.createdAt || 0)),
  )[0];
}

export function buildCreateCompanyBodyFromProfileForm(form) {
  const name = String(form.company || "").trim();
  const location = [form.city, form.country].map((value) => String(value || "").trim()).filter(Boolean).join(", ");
  return {
    name,
    location: location || undefined,
  };
}

export function buildUpdateCompanyBody(company, { name, location } = {}) {
  const nextName = String(name ?? company?.name ?? "").trim();
  const nextLocation = location !== undefined ? String(location || "").trim() : String(company?.location || "").trim();
  return {
    name: nextName,
    logoUrl: company?.logoUrl || undefined,
    industry: company?.industry || undefined,
    location: nextLocation || undefined,
    websiteUrl: company?.websiteUrl || undefined,
    description: company?.description || undefined,
  };
}
