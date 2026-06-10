import { createContext, useContext, useMemo, useState } from "react";
import { initialVacancies } from "../../shared/constants/mockData";
import { readJson, writeJson } from "../../shared/lib/storage";

const VACANCIES_KEY = "spaVacancies";
const VacanciesContext = createContext(null);

export function VacanciesProvider({ children }) {
  const [vacancies] = useState(() => readJson(VACANCIES_KEY, initialVacancies));
  const [appliedIds, setAppliedIds] = useState(() => readJson("spaAppliedVacancies", []));

  const value = useMemo(
    () => ({
      vacancies,
      appliedIds,
      apply(vacancyId) {
        if (appliedIds.includes(vacancyId)) return;
        const next = [...appliedIds, vacancyId];
        setAppliedIds(next);
        writeJson("spaAppliedVacancies", next);
        writeJson(VACANCIES_KEY, vacancies);
      },
    }),
    [appliedIds, vacancies],
  );

  return <VacanciesContext.Provider value={value}>{children}</VacanciesContext.Provider>;
}

export function useVacanciesStore() {
  const ctx = useContext(VacanciesContext);
  if (!ctx) throw new Error("useVacanciesStore must be used inside VacanciesProvider");
  return ctx;
}
