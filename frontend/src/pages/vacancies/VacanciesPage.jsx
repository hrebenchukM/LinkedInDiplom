import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { useChatStore } from "../../features/chat/ChatStore";
import * as jobsApi from "../../features/jobs/jobsApi";
import { mapVacancyDtoToJob } from "../../features/jobs/mapJobs";
import { fetchCompaniesByIds } from "../../features/professional/professionalApi";
import { useBackendApi } from "../../shared/hooks/useBackendApi";
import { patchRegisteredAccount, readRegisteredAccount } from "../../shared/lib/registeredAccount";

const VAC_JOBS_NAV = [
  { id: "browse", labelKey: "vac.nav.parameters", fallback: "Parameters", icon: "parameters" },
  { id: "mine", labelKey: "vac.nav.myJobs", fallback: "My jobs", icon: "mine" },
  { id: "saved", labelKey: "vac.nav.savedJobs", fallback: "Saved vacancies", icon: "saved" },
];

function VacJobsNavIcon({ type }) {
  const common = { viewBox: "0 0 24 24", fill: "currentColor", focusable: "false" };
  if (type === "parameters") {
    return (
      <svg {...common}>
        <path d="M3 17h6v-2H3v2zm0-5h10v-2H3v2zm0-7v2h14V5H3zm8 12h4v-2h-4v2zm0-5h6v-2h-6v2zm0-5h8V7h-8v2z" />
      </svg>
    );
  }
  if (type === "mine") {
    return (
      <svg {...common}>
        <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15-5-2.18-5 2.18V5h10v13z" />
    </svg>
  );
}

function t(key, fallback) {
  return typeof window.uiT === "function" ? window.uiT(key, fallback) : fallback || key;
}

function tmpl(key, vars, fallback) {
  return typeof window.uiTmpl === "function" ? window.uiTmpl(key, vars) : fallback || key;
}

function formatSalary(min, max) {
  if (min && max) return tmpl("vac.salary.range", { min, max }, `$${min}k — $${max}k / year`);
  if (min) return tmpl("vac.salary.from", { min }, `$${min}k+ / year`);
  return "";
}

function formatPosted(days) {
  const n = Number(days) || 0;
  if (n <= 1) return t("vac.meta.dayAgo", "1 day ago");
  if (n < 7) return tmpl("vac.meta.daysAgo", { n }, `${n} days ago`);
  if (n < 14) return t("vac.meta.weekAgo", "1 week ago");
  return tmpl("vac.meta.weeksAgo", { n: Math.floor(n / 7) }, `${Math.floor(n / 7)} weeks ago`);
}

const POSTED_JOBS_KEY = "vacancyPostedJobs";
const SAVED_JOBS_KEY = "vacancySavedJobs";
const APPLICATIONS_KEY = "vacancyApplications";
const MAX_RESUME_SIZE = 1_800_000;

const IT_JOBS = [
  {
    id: "it-1",
    role: "Frontend Developer",
    company: "Stripe",
    location: "Remote",
    type: "full-time",
    level: "senior",
    remote: "yes",
    salaryMin: 140,
    salaryMax: 185,
    postedDays: 2,
    seed: "Stripe",
    keywords: "react typescript javascript frontend css html",
    tags: ["Full-time", "Senior", "Remote", "React"],
    desc: {
      en: "Build payment UI components with React and TypeScript. Collaborate with design and backend teams on merchant-facing dashboards.",
      ru: "Разработка UI платёжных компонентов на React и TypeScript. Работа с дизайном и backend над дашбордами для мерчантов.",
      uk: "Розробка UI платіжних компонентів на React і TypeScript. Співпраця з дизайном і backend над дашбордами для мерчантів.",
    },
  },
  {
    id: "it-2",
    role: "Backend Engineer",
    company: "GitHub",
    location: "Remote",
    type: "full-time",
    level: "senior",
    remote: "yes",
    salaryMin: 150,
    salaryMax: 195,
    postedDays: 3,
    seed: "GitHub",
    keywords: "go ruby api microservices backend distributed",
    tags: ["Full-time", "Senior", "Remote", "Go"],
    desc: {
      en: "Design and scale APIs powering code hosting and CI/CD. Work on distributed systems with high availability requirements.",
      ru: "Проектирование и масштабирование API для хостинга кода и CI/CD. Работа с распределёнными системами высокой доступности.",
      uk: "Проєктування та масштабування API для хостингу коду та CI/CD. Робота з розподіленими системами високої доступності.",
    },
  },
  {
    id: "it-3",
    role: "Full Stack Developer",
    company: "Vercel",
    location: "Remote",
    type: "full-time",
    level: "middle",
    remote: "yes",
    salaryMin: 115,
    salaryMax: 150,
    postedDays: 1,
    seed: "Vercel",
    keywords: "nextjs react node fullstack javascript typescript",
    tags: ["Full-time", "Middle", "Remote", "Next.js"],
    desc: {
      en: "Ship features across Next.js apps and edge infrastructure. Own end-to-end delivery from API to polished UI.",
      ru: "Разработка фич в Next.js и edge-инфраструктуре. Полный цикл — от API до готового интерфейса.",
      uk: "Розробка фіч у Next.js та edge-інфраструктурі. Повний цикл — від API до готового інтерфейсу.",
    },
  },
  {
    id: "it-4",
    role: "React Developer",
    company: "Meta",
    location: "Menlo Park, CA",
    type: "full-time",
    level: "senior",
    remote: "no",
    salaryMin: 160,
    salaryMax: 210,
    postedDays: 5,
    seed: "Meta",
    keywords: "react javascript frontend performance graphql",
    tags: ["Full-time", "Senior", "On-site", "React"],
    desc: {
      en: "Optimize React performance for billions of users. Build reusable component libraries and tooling for internal teams.",
      ru: "Оптимизация React для миллиардов пользователей. Библиотеки компонентов и инструменты для внутренних команд.",
      uk: "Оптимізація React для мільярдів користувачів. Бібліотеки компонентів та інструменти для внутрішніх команд.",
    },
  },
  {
    id: "it-5",
    role: "Node.js Engineer",
    company: "Netflix",
    location: "Remote",
    type: "full-time",
    level: "senior",
    remote: "yes",
    salaryMin: 145,
    salaryMax: 190,
    postedDays: 4,
    seed: "Netflix",
    keywords: "nodejs javascript backend streaming api",
    tags: ["Full-time", "Senior", "Remote", "Node.js"],
    desc: {
      en: "Build microservices for content delivery and personalization. Focus on reliability, observability, and low latency.",
      ru: "Микросервисы для доставки контента и персонализации. Надёжность, observability и низкая задержка.",
      uk: "Мікросервіси для доставки контенту та персоналізації. Надійність, observability і низька затримка.",
    },
  },
  {
    id: "it-6",
    role: "Python Developer",
    company: "Spotify",
    location: "Stockholm, SE",
    type: "full-time",
    level: "middle",
    remote: "hybrid",
    salaryMin: 90,
    salaryMax: 120,
    postedDays: 6,
    seed: "Spotify",
    keywords: "python django flask backend api data",
    tags: ["Full-time", "Middle", "Hybrid", "Python"],
    desc: {
      en: "Develop backend services for music recommendations and playlist features. Work with data pipelines and ML teams.",
      ru: "Backend-сервисы для рекомендаций и плейлистов. Интеграция с data pipeline и ML-командами.",
      uk: "Backend-сервіси для рекомендацій і плейлистів. Інтеграція з data pipeline та ML-командами.",
    },
  },
  {
    id: "it-7",
    role: "Java Developer",
    company: "Amazon",
    location: "Seattle, WA",
    type: "full-time",
    level: "senior",
    remote: "no",
    salaryMin: 130,
    salaryMax: 175,
    postedDays: 7,
    seed: "Amazon",
    keywords: "java spring aws backend ecommerce",
    tags: ["Full-time", "Senior", "On-site", "Java"],
    desc: {
      en: "Build high-throughput services for marketplace checkout and inventory. Follow Amazon leadership principles.",
      ru: "Высоконагруженные сервисы checkout и инвентаря маркетплейса. Работа по принципам Amazon.",
      uk: "Високонавантажені сервіси checkout та інвентарю маркетплейсу. Робота за принципами Amazon.",
    },
  },
  {
    id: "it-8",
    role: "DevOps Engineer",
    company: "Google",
    location: "Mountain View, CA",
    type: "full-time",
    level: "senior",
    remote: "hybrid",
    salaryMin: 155,
    salaryMax: 200,
    postedDays: 2,
    seed: "Google",
    keywords: "devops kubernetes terraform ci cd gcp",
    tags: ["Full-time", "Senior", "Hybrid", "DevOps"],
    desc: {
      en: "Automate deployments on GKE and improve developer velocity. Own CI/CD pipelines and infrastructure as code.",
      ru: "Автоматизация деплоев на GKE и ускорение разработки. CI/CD и infrastructure as code.",
      uk: "Автоматизація деплоїв на GKE та прискорення розробки. CI/CD і infrastructure as code.",
    },
  },
  {
    id: "it-9",
    role: "Site Reliability Engineer",
    company: "Datadog",
    location: "Remote",
    type: "full-time",
    level: "middle",
    remote: "yes",
    salaryMin: 125,
    salaryMax: 165,
    postedDays: 3,
    seed: "Datadog",
    keywords: "sre reliability monitoring oncall kubernetes",
    tags: ["Full-time", "Middle", "Remote", "SRE"],
    desc: {
      en: "Keep observability platform running at scale. On-call rotation, incident response, and capacity planning.",
      ru: "Поддержка платформы observability в масштабе. On-call, инциденты и планирование ёмкости.",
      uk: "Підтримка платформи observability у масштабі. On-call, інциденти та планування потужності.",
    },
  },
  {
    id: "it-10",
    role: "Cloud Architect",
    company: "AWS",
    location: "Remote",
    type: "full-time",
    level: "lead",
    remote: "yes",
    salaryMin: 170,
    salaryMax: 220,
    postedDays: 8,
    seed: "AWS",
    keywords: "cloud architect aws azure infrastructure security",
    tags: ["Full-time", "Lead", "Remote", "Cloud"],
    desc: {
      en: "Design multi-region architectures for enterprise customers. Lead technical workshops and migration programs.",
      ru: "Проектирование multi-region архитектур для enterprise. Воркшопы и программы миграции.",
      uk: "Проєктування multi-region архітектур для enterprise. Воркшопи та програми міграції.",
    },
  },
  {
    id: "it-11",
    role: "Data Engineer",
    company: "Snowflake",
    location: "Remote",
    type: "full-time",
    level: "senior",
    remote: "yes",
    salaryMin: 135,
    salaryMax: 180,
    postedDays: 4,
    seed: "Snowflake",
    keywords: "data engineer sql spark etl warehouse analytics",
    tags: ["Full-time", "Senior", "Remote", "Data"],
    desc: {
      en: "Build ETL pipelines and data models for analytics products. Optimize query performance on Snowflake.",
      ru: "ETL-пайплайны и модели данных для аналитики. Оптимизация запросов в Snowflake.",
      uk: "ETL-пайплайни та моделі даних для аналітики. Оптимізація запитів у Snowflake.",
    },
  },
  {
    id: "it-12",
    role: "Machine Learning Engineer",
    company: "OpenAI",
    location: "San Francisco, CA",
    type: "full-time",
    level: "senior",
    remote: "hybrid",
    salaryMin: 180,
    salaryMax: 250,
    postedDays: 1,
    seed: "OpenAI",
    keywords: "machine learning ai python pytorch llm nlp",
    tags: ["Full-time", "Senior", "Hybrid", "ML/AI"],
    desc: {
      en: "Train and deploy large language models. Improve inference latency and safety guardrails in production.",
      ru: "Обучение и деплой LLM. Оптимизация inference и safety guardrails в проде.",
      uk: "Навчання та деплой LLM. Оптимізація inference і safety guardrails у проді.",
    },
  },
  {
    id: "it-13",
    role: "iOS Developer",
    company: "Apple",
    location: "Cupertino, CA",
    type: "full-time",
    level: "middle",
    remote: "no",
    salaryMin: 120,
    salaryMax: 160,
    postedDays: 9,
    seed: "Apple",
    keywords: "ios swift mobile uikit swiftui apple",
    tags: ["Full-time", "Middle", "On-site", "iOS"],
    desc: {
      en: "Develop native iOS features for system apps. Work with SwiftUI, performance profiling, and accessibility.",
      ru: "Нативные iOS-фичи для системных приложений. SwiftUI, профилирование и accessibility.",
      uk: "Нативні iOS-фічі для системних застосунків. SwiftUI, профілювання та accessibility.",
    },
  },
  {
    id: "it-14",
    role: "Android Developer",
    company: "Google",
    location: "Remote",
    type: "full-time",
    level: "middle",
    remote: "yes",
    salaryMin: 125,
    salaryMax: 165,
    postedDays: 5,
    seed: "GoogleAndroid",
    keywords: "android kotlin mobile jetpack compose",
    tags: ["Full-time", "Middle", "Remote", "Android"],
    desc: {
      en: "Ship Android SDK features used by millions of apps. Kotlin, Jetpack Compose, and Play Store compliance.",
      ru: "Фичи Android SDK для миллионов приложений. Kotlin, Jetpack Compose, требования Play Store.",
      uk: "Фічі Android SDK для мільйонів застосунків. Kotlin, Jetpack Compose, вимоги Play Store.",
    },
  },
  {
    id: "it-15",
    role: "QA Automation Engineer",
    company: "Microsoft",
    location: "Remote",
    type: "full-time",
    level: "middle",
    remote: "yes",
    salaryMin: 95,
    salaryMax: 130,
    postedDays: 6,
    seed: "Microsoft",
    keywords: "qa automation testing selenium cypress playwright",
    tags: ["Full-time", "Middle", "Remote", "QA"],
    desc: {
      en: "Build automated test suites for cloud products. Integrate tests into Azure DevOps pipelines.",
      ru: "Автотесты для облачных продуктов. Интеграция в Azure DevOps pipelines.",
      uk: "Автотести для хмарних продуктів. Інтеграція в Azure DevOps pipelines.",
    },
  },
  {
    id: "it-16",
    role: "Security Engineer",
    company: "Cloudflare",
    location: "Remote",
    type: "full-time",
    level: "senior",
    remote: "yes",
    salaryMin: 140,
    salaryMax: 185,
    postedDays: 3,
    seed: "Cloudflare",
    keywords: "security engineer appsec pentest owasp zero trust",
    tags: ["Full-time", "Senior", "Remote", "Security"],
    desc: {
      en: "Harden edge network services and respond to security incidents. Threat modeling and secure code reviews.",
      ru: "Защита edge-сервисов и реагирование на инциденты. Threat modeling и secure code review.",
      uk: "Захист edge-сервісів і реагування на інциденти. Threat modeling і secure code review.",
    },
  },
  {
    id: "it-17",
    role: "Product Manager",
    company: "Atlassian",
    location: "Remote",
    type: "full-time",
    level: "senior",
    remote: "yes",
    salaryMin: 130,
    salaryMax: 170,
    postedDays: 10,
    seed: "Atlassian",
    keywords: "product manager roadmap agile jira confluence",
    tags: ["Full-time", "Senior", "Remote", "Product"],
    desc: {
      en: "Own roadmap for collaboration tools used by engineering teams. Define metrics, run betas, and ship iteratively.",
      ru: "Roadmap инструментов для инженерных команд. Метрики, беты и итеративные релизы.",
      uk: "Roadmap інструментів для інженерних команд. Метрики, бета та ітеративні релізи.",
    },
  },
  {
    id: "it-18",
    role: "UX/UI Designer",
    company: "Figma",
    location: "Remote",
    type: "full-time",
    level: "middle",
    remote: "yes",
    salaryMin: 100,
    salaryMax: 140,
    postedDays: 7,
    seed: "Figma",
    keywords: "ux ui designer figma design system prototyping",
    tags: ["Full-time", "Middle", "Remote", "Design"],
    desc: {
      en: "Design editor experiences and design-system components. Partner with research and engineering on usability.",
      ru: "Дизайн редактора и компонентов design system. Исследования и инженерия для usability.",
      uk: "Дизайн редактора та компонентів design system. Дослідження та інженерія для usability.",
    },
  },
  {
    id: "it-19",
    role: "Technical Writer",
    company: "GitLab",
    location: "Remote",
    type: "full-time",
    level: "entry",
    remote: "yes",
    salaryMin: 70,
    salaryMax: 95,
    postedDays: 12,
    seed: "GitLab",
    keywords: "technical writer documentation api docs developer",
    tags: ["Full-time", "Junior", "Remote", "Docs"],
    desc: {
      en: "Write developer documentation for CI/CD and DevSecOps features. Maintain API references and tutorials.",
      ru: "Документация для CI/CD и DevSecOps. API-справочники и обучающие материалы.",
      uk: "Документація для CI/CD і DevSecOps. API-довідники та навчальні матеріали.",
    },
  },
  {
    id: "it-20",
    role: "Scrum Master",
    company: "IBM",
    location: "Remote",
    type: "full-time",
    level: "middle",
    remote: "yes",
    salaryMin: 85,
    salaryMax: 115,
    postedDays: 14,
    seed: "IBM",
    keywords: "scrum master agile kanban facilitator",
    tags: ["Full-time", "Middle", "Remote", "Agile"],
    desc: {
      en: "Facilitate agile ceremonies for distributed engineering squads. Remove blockers and improve delivery predictability.",
      ru: "Agile-церемонии для распределённых команд. Снятие блокеров и предсказуемость поставки.",
      uk: "Agile-церемонії для розподілених команд. Зняття блокерів і передбачуваність поставки.",
    },
  },
  {
    id: "it-21",
    role: "Blockchain Developer",
    company: "Coinbase",
    location: "Remote",
    type: "full-time",
    level: "senior",
    remote: "yes",
    salaryMin: 150,
    salaryMax: 200,
    postedDays: 4,
    seed: "Coinbase",
    keywords: "blockchain solidity web3 smart contracts crypto",
    tags: ["Full-time", "Senior", "Remote", "Web3"],
    desc: {
      en: "Build secure wallet and trading infrastructure on Ethereum L2. Smart contract audits and key management.",
      ru: "Кошельки и торговая инфраструктура на Ethereum L2. Аудит смарт-контрактов и key management.",
      uk: "Гаманці та торгова інфраструктура на Ethereum L2. Аудит смарт-контрактів і key management.",
    },
  },
  {
    id: "it-22",
    role: "Golang Developer",
    company: "Uber",
    location: "Remote",
    type: "full-time",
    level: "senior",
    remote: "yes",
    salaryMin: 140,
    salaryMax: 185,
    postedDays: 2,
    seed: "Uber",
    keywords: "golang go backend microservices distributed",
    tags: ["Full-time", "Senior", "Remote", "Go"],
    desc: {
      en: "Develop real-time dispatch and mapping services in Go. Focus on concurrency, geo queries, and low latency.",
      ru: "Real-time dispatch и карты на Go. Concurrency, geo-запросы и низкая задержка.",
      uk: "Real-time dispatch і карти на Go. Concurrency, geo-запити та низька затримка.",
    },
  },
  {
    id: "it-23",
    role: ".NET Developer",
    company: "Microsoft",
    location: "Remote",
    type: "full-time",
    level: "middle",
    remote: "yes",
    salaryMin: 110,
    salaryMax: 145,
    postedDays: 5,
    seed: "MicrosoftNet",
    keywords: "csharp dotnet aspnet backend azure",
    tags: ["Full-time", "Middle", "Remote", "C# / .NET"],
    desc: {
      en: "Build enterprise APIs with ASP.NET Core and Azure. Entity Framework, authentication, and cloud-native patterns.",
      ru: "Enterprise API на ASP.NET Core и Azure. Entity Framework, auth и cloud-native паттерны.",
      uk: "Enterprise API на ASP.NET Core і Azure. Entity Framework, auth і cloud-native патерни.",
    },
  },
  {
    id: "it-24",
    role: "Embedded Software Engineer",
    company: "Tesla",
    location: "Austin, TX",
    type: "full-time",
    level: "senior",
    remote: "no",
    salaryMin: 125,
    salaryMax: 165,
    postedDays: 11,
    seed: "Tesla",
    keywords: "embedded c cpp firmware automotive rtos",
    tags: ["Full-time", "Senior", "On-site", "Embedded"],
    desc: {
      en: "Develop firmware for vehicle control systems. C/C++, RTOS, and hardware-in-the-loop testing.",
      ru: "Firmware для систем управления автомобилем. C/C++, RTOS и hardware-in-the-loop тесты.",
      uk: "Firmware для систем керування автомобілем. C/C++, RTOS і hardware-in-the-loop тести.",
    },
  },
  {
    id: "it-25",
    role: "IT Support Specialist",
    company: "Dell",
    location: "Remote",
    type: "full-time",
    level: "entry",
    remote: "yes",
    salaryMin: 45,
    salaryMax: 60,
    postedDays: 8,
    seed: "Dell",
    keywords: "it support helpdesk troubleshooting windows mac",
    tags: ["Full-time", "Junior", "Remote", "IT Support"],
    desc: {
      en: "Resolve hardware and software issues for remote employees. Ticketing, onboarding, and asset management.",
      ru: "Поддержка удалённых сотрудников: железо и софт. Тикеты, onboarding и учёт активов.",
      uk: "Підтримка віддалених співробітників: залізо та софт. Тікети, onboarding і облік активів.",
    },
  },
  {
    id: "it-26",
    role: "Product Analyst",
    company: "Airtable",
    location: "Remote",
    type: "full-time",
    level: "middle",
    remote: "yes",
    salaryMin: 85,
    salaryMax: 110,
    postedDays: 7,
    seed: "Airtable",
    keywords: "product analyst sql bi metrics analytics dashboard",
    tags: ["Full-time", "Middle", "Remote", "SQL + BI"],
    desc: {
      en: "Analyze product metrics, build dashboards, and find growth opportunities in the funnel. Partner with PM, Design, and Engineering.",
      ru: "Анализ продуктовых метрик, дашборды и точки роста в воронке. Работа с PM, Design и Engineering.",
      uk: "Аналіз продуктових метрик, дашборди та точки росту у воронці. Співпраця з PM, Design і Engineering.",
    },
  },
  {
    id: "it-27",
    role: "TypeScript Engineer",
    company: "Linear",
    location: "Remote",
    type: "full-time",
    level: "senior",
    remote: "yes",
    salaryMin: 130,
    salaryMax: 175,
    postedDays: 1,
    seed: "Linear",
    keywords: "typescript react graphql frontend performance",
    tags: ["Full-time", "Senior", "Remote", "TypeScript"],
    desc: {
      en: "Craft fast, keyboard-driven UI for issue tracking. Deep TypeScript, React, and real-time sync.",
      ru: "Быстрый keyboard-driven UI для трекера задач. TypeScript, React и real-time sync.",
      uk: "Швидкий keyboard-driven UI для трекера задач. TypeScript, React і real-time sync.",
    },
  },
  {
    id: "it-28",
    role: "Platform Engineer",
    company: "HashiCorp",
    location: "Remote",
    type: "full-time",
    level: "senior",
    remote: "yes",
    salaryMin: 145,
    salaryMax: 190,
    postedDays: 3,
    seed: "HashiCorp",
    keywords: "platform engineer terraform vault consul kubernetes",
    tags: ["Full-time", "Senior", "Remote", "Platform"],
    desc: {
      en: "Build internal developer platform with Terraform and Vault. Enable self-service infra for product teams.",
      ru: "Internal developer platform на Terraform и Vault. Self-service инфра для продуктовых команд.",
      uk: "Internal developer platform на Terraform і Vault. Self-service інфра для продуктових команд.",
    },
  },
];

function readPostedJobs() {
  try {
    const raw = localStorage.getItem(POSTED_JOBS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writePostedJobs(jobs) {
  try {
    localStorage.setItem(POSTED_JOBS_KEY, JSON.stringify(jobs));
  } catch {
    // ignore
  }
}

function readSavedJobs() {
  try {
    const raw = localStorage.getItem(SAVED_JOBS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return Object.fromEntries(parsed.map((id) => [String(id), { id: String(id) }]));
    }
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeSavedJobs(map) {
  try {
    localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(map || {}));
  } catch {
    // ignore
  }
}

function readApplications() {
  try {
    const raw = localStorage.getItem(APPLICATIONS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeApplications(map) {
  try {
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(map || {}));
  } catch {
    // ignore
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("read_file_error"));
    reader.readAsDataURL(file);
  });
}

function snapshotJob(job) {
  const role = String(job.role || job.title || "").trim();
  const company = String(job.company || "").trim();
  const location = String(job.location || job.city || "").trim();
  const id = `${role.toLowerCase()}|${company.toLowerCase()}|${location.toLowerCase()}`;
  return {
    id,
    role,
    company,
    location,
    salary: formatSalary(job.salaryMin, job.salaryMax),
    meta: formatPosted(job.postedDays),
  };
}

function formatDate(iso) {
  const ms = Date.parse(String(iso || ""));
  if (!Number.isFinite(ms)) return "—";
  const lang = typeof window.getUiLang === "function" && window.getUiLang() === "en" ? "en-US" : "ru-RU";
  return new Date(ms).toLocaleDateString(lang, { day: "2-digit", month: "short", year: "numeric" });
}

function getLang() {
  return typeof window.getUiLang === "function" ? window.getUiLang() : "en";
}

function jobDesc(job) {
  const lang = getLang();
  const d = job.desc || {};
  if (typeof d === "string") return d;
  return d[lang] || d.en || "";
}

export function VacanciesPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { chats } = useChatStore();
  const useApi = useBackendApi();
  const [mode, setMode] = useState("browse");
  const [activityTab, setActivityTab] = useState("applied");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [jobLevel, setJobLevel] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [activeJobForApply, setActiveJobForApply] = useState(null);
  const [apiJobs, setApiJobs] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const [jobsLoading, setJobsLoading] = useState(false);
  const [postedJobs, setPostedJobs] = useState(() => readPostedJobs());
  const [savedJobsMap, setSavedJobsMap] = useState(() => readSavedJobs());
  const [applicationsMap, setApplicationsMap] = useState(() => readApplications());
  const [, forceLangRerender] = useState(0);
  const [applyForm, setApplyForm] = useState({ fullName: "", email: "", phone: "", about: "" });
  const [applyError, setApplyError] = useState("");
  const [selectedResumeName, setSelectedResumeName] = useState("");
  const [selectedResumeData, setSelectedResumeData] = useState("");
  const [postForm, setPostForm] = useState({
    role: "",
    company: "",
    location: "",
    type: "full-time",
    level: "middle",
    remote: "yes",
    salaryMin: "",
    salaryMax: "",
    desc: "",
    keywords: "",
  });

  const reloadVacancies = useCallback(async () => {
    if (!useApi) return;
    setJobsLoading(true);
    try {
      const [dtos, favorites, apps] = await Promise.all([
        jobsApi.fetchVacancies({
          query: query.trim() || undefined,
          location: location.trim() || undefined,
        }),
        jobsApi.fetchMyFavorites(),
        jobsApi.fetchMyApplications(),
      ]);
      const companyIds = dtos.map((d) => d.companyId).filter(Boolean);
      const companies = await fetchCompaniesByIds(companyIds);
      setApiJobs(
        dtos.map((dto) => mapVacancyDtoToJob(dto, companies[dto.companyId]?.name || "")),
      );
      setFavoriteIds(new Set((favorites || []).map((f) => String(f.vacancyId)).filter(Boolean)));
      const map = {};
      apps.forEach((app) => {
        const vacancyId = app?.vacancyId || app?.VacancyId;
        if (vacancyId) map[String(vacancyId)] = app;
      });
      setApplicationsMap(map);
      writeApplications(map);
    } catch {
      setApiJobs([]);
    } finally {
      setJobsLoading(false);
    }
  }, [useApi, query, location]);

  useEffect(() => {
    if (useApi) reloadVacancies();
  }, [useApi, reloadVacancies]);

  const allJobs = useMemo(() => {
    if (useApi) return [...postedJobs, ...apiJobs];
    return [...postedJobs, ...IT_JOBS];
  }, [postedJobs, apiJobs, useApi]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const l = location.trim().toLowerCase();
    const min = Number(salaryMin) || 0;
    const list = allJobs.filter((job) => {
      const title = String(job.title || job.role || "").toLowerCase();
      const company = String(job.company || "").toLowerCase();
      const city = String(job.city || job.location || "").toLowerCase();
      const keywords = String(job.keywords || "").toLowerCase();
      const queryOk = !q || title.includes(q) || company.includes(q) || keywords.includes(q);
      const locOk = !l || city.includes(l);
      const typeOk = !jobType || String(job.type || "").toLowerCase() === jobType;
      const levelOk = !jobLevel || String(job.level || "").toLowerCase() === jobLevel;
      const remoteOk = !remoteOnly || String(job.remote || "").toLowerCase() === "yes" || city.includes("remote");
      const salaryOk = !min || Number(job.salaryMin || 0) >= min;
      return queryOk && locOk && typeOk && levelOk && remoteOk && salaryOk;
    });
    if (sortBy === "salary_desc") list.sort((a, b) => Number(b.salaryMin || 0) - Number(a.salaryMin || 0));
    if (sortBy === "salary_asc") list.sort((a, b) => Number(a.salaryMin || 0) - Number(b.salaryMin || 0));
    if (sortBy === "newest") list.sort((a, b) => Number(a.postedDays || 9999) - Number(b.postedDays || 9999));
    return list;
  }, [allJobs, jobLevel, jobType, location, query, remoteOnly, salaryMin, sortBy]);

  const topJobs = useMemo(() => filtered.slice(0, 5), [filtered]);
  const itJobs = useMemo(() => filtered.slice(5), [filtered]);

  const focusJobSearch = ({ clearFilters = false, searchQuery } = {}) => {
    setMode("browse");
    if (clearFilters) {
      setQuery("");
      setLocation("");
      setJobType("");
      setJobLevel("");
      setSalaryMin("");
      setRemoteOnly(false);
      setSortBy("relevance");
    }
    if (searchQuery !== undefined) setQuery(searchQuery);
    window.requestAnimationFrame(() => {
      document.getElementById("vacAdvancedSearch")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };
  const myJobs = useMemo(() => postedJobs, [postedJobs]);
  const savedJobIds = useMemo(() => new Set(Object.keys(savedJobsMap)), [savedJobsMap]);
  const appliedJobIds = useMemo(() => new Set(Object.keys(applicationsMap)), [applicationsMap]);
  const appliedJobs = useMemo(
    () =>
      Object.values(applicationsMap).sort(
        (a, b) => Date.parse(String(b.submittedAt || "")) - Date.parse(String(a.submittedAt || "")),
      ),
    [applicationsMap],
  );
  const savedJobs = useMemo(() => Object.values(savedJobsMap), [savedJobsMap]);

  useEffect(() => {
    function onUiLangChange() {
      forceLangRerender((v) => v + 1);
    }
    document.addEventListener("uilangchange", onUiLangChange);
    return () => document.removeEventListener("uilangchange", onUiLangChange);
  }, []);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key !== "Escape") return;
      if (applyModalOpen) setApplyModalOpen(false);
      if (postModalOpen) setPostModalOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [applyModalOpen, postModalOpen]);

  useEffect(() => {
    const hasModal = applyModalOpen || postModalOpen;
    const prev = document.body.style.overflow;
    if (hasModal) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [applyModalOpen, postModalOpen]);

  useEffect(() => {
    document.dispatchEvent(new CustomEvent("vacjobsrendered"));
  }, [topJobs, itJobs, myJobs]);

  useEffect(() => {
    window.VAC_IT_JOBS = IT_JOBS;
    window.getPostedVacancyJobs = readPostedJobs;
    window.savePostedVacancyJob = (job) => {
      if (!job || typeof job !== "object") return;
      const normalized = {
        id: String(job.id || `my-${Date.now()}`),
        role: String(job.role || job.title || "Custom Role"),
        company: String(job.company || "Custom Company"),
        location: String(job.location || job.city || "Remote"),
        type: String(job.type || "full-time"),
        level: String(job.level || "middle"),
        remote: String(job.remote || "yes"),
        salaryMin: Number(job.salaryMin) || 0,
        salaryMax: Number(job.salaryMax) || 0,
        postedDays: Number(job.postedDays) || 0,
        seed: String(job.seed || job.company || "CustomCompany"),
        keywords: String(job.keywords || ""),
        tags: Array.isArray(job.tags) ? job.tags : [],
        desc:
          typeof job.desc === "string"
            ? { en: job.desc, ru: job.desc, uk: job.desc }
            : job.desc || { en: "Custom job description", ru: "Custom job description", uk: "Custom job description" },
        userPosted: true,
      };
      setPostedJobs((prev) => {
        const next = [normalized, ...prev];
        writePostedJobs(next);
        return next;
      });
    };
    window.renderVacancyJobs = () => {
      forceLangRerender((v) => v + 1);
    };
    window.renderVacancyJobsForList = () => {
      forceLangRerender((v) => v + 1);
    };
    window.renderMyPostedJobs = () => {
      forceLangRerender((v) => v + 1);
    };
    window.refreshVacancySearch = () => {
      forceLangRerender((v) => v + 1);
    };
    window.setVacancyView = (view) => {
      setMode(view === "mine" ? "mine" : "browse");
    };
    return () => {
      delete window.savePostedVacancyJob;
      delete window.VAC_IT_JOBS;
      delete window.renderVacancyJobs;
      delete window.getPostedVacancyJobs;
      delete window.renderVacancyJobsForList;
      delete window.renderMyPostedJobs;
      delete window.refreshVacancySearch;
      delete window.setVacancyView;
    };
  }, []);

  function notify(text) {
    if (typeof window.showUiNotice === "function") {
      window.showUiNotice(text);
      return;
    }
    window.alert(text);
  }

  function getRowJobId(job) {
    const role = String(job.role || job.title || "").trim().toLowerCase();
    const company = String(job.company || "").trim().toLowerCase();
    const location = String(job.location || job.city || "").trim().toLowerCase();
    return [role, company, location].join("|");
  }

  async function handleSave(job) {
    const vacancyId = String(job.id);
    if (useApi && job._api) {
      const isFav = favoriteIds.has(vacancyId);
      try {
        if (isFav) {
          await jobsApi.removeFavorite(vacancyId);
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            next.delete(vacancyId);
            return next;
          });
        } else {
          await jobsApi.addFavorite(vacancyId);
          setFavoriteIds((prev) => new Set(prev).add(vacancyId));
        }
      } catch {
        notify(t("vac.favoriteFailed", "Could not update saved vacancies."));
      }
      return;
    }
    const id = getRowJobId(job);
    setSavedJobsMap((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = snapshotJob(job);
      writeSavedJobs(next);
      return next;
    });
  }

  function handleWithdrawApplication(id) {
    setApplicationsMap((prev) => {
      const next = { ...prev };
      delete next[id];
      writeApplications(next);
      return next;
    });
    if (typeof window.pushUiNotification === "function") window.pushUiNotification(t("vac.withdrawDone", "Application withdrawn"));
    else notify(t("vac.withdrawDone", "Application withdrawn"));
  }

  function handleRemoveSaved(id) {
    setSavedJobsMap((prev) => {
      const next = { ...prev };
      delete next[id];
      writeSavedJobs(next);
      return next;
    });
    notify(t("vac.unsaved", "Removed from saved jobs"));
  }

  function fillApplyDefaults() {
    const account = readRegisteredAccount();
    const user = session.user || {};
    const fullName = [account.firstName, account.lastName].filter(Boolean).join(" ").trim();
    setApplyForm({
      fullName: fullName || user.name || "",
      email: account.email || user.email || "",
      phone: account.phone || "",
      about: "",
    });
    setSelectedResumeName(account.resumeName || "");
    setSelectedResumeData(account.resumeDataUrl || "");
    setApplyError("");
  }

  function openApplyModalFor(job) {
    setActiveJobForApply(job);
    fillApplyDefaults();
    setApplyModalOpen(true);
  }

  function saveResumeToProfile(name, dataUrl) {
    if (!name || !dataUrl) return;
    patchRegisteredAccount({ resumeName: name, resumeDataUrl: dataUrl });
  }

  function openSavedVacancies() {
    setMode("saved");
    setActivityTab("saved");
  }

  function handlePostSubmit(event) {
    event.preventDefault();
    const item = {
      id: `my-${Date.now()}`,
      role: postForm.role,
      company: postForm.company,
      location: postForm.location,
      type: postForm.type,
      level: postForm.level,
      remote: postForm.remote,
      salaryMin: Number(postForm.salaryMin) || 0,
      salaryMax: Number(postForm.salaryMax) || 0,
      postedDays: 0,
      seed: postForm.company || "CustomCompany",
      keywords: postForm.keywords,
      tags: [
        postForm.type === "full-time" ? "Full-time" : postForm.type,
        postForm.level,
        postForm.remote === "yes" ? "Remote" : postForm.remote === "hybrid" ? "Hybrid" : "On-site",
      ],
      desc: {
        en: postForm.desc || "Custom job description",
        ru: postForm.desc || "Custom job description",
        uk: postForm.desc || "Custom job description",
      },
      userPosted: true,
    };
    setPostedJobs((prev) => {
      const next = [item, ...prev];
      writePostedJobs(next);
      return next;
    });
    setPostForm({
      role: "",
      company: "",
      location: "",
      type: "full-time",
      level: "middle",
      remote: "yes",
      salaryMin: "",
      salaryMax: "",
      desc: "",
      keywords: "",
    });
    setPostModalOpen(false);
    setMode("mine");
    notify(`${t("vac.postDone", "Job published")}: ${item.role} — ${item.company}`);
  }

  function JobList({ jobs }) {
    return (
      <ul className="vac-job-list">
        {jobs.map((job) => {
          const id = String(job.id);
          const rowId = getRowJobId(job);
          const role = job.role || job.title;
          const city = job.location || job.city || t("vac.location.remote", "Remote");
          const isSaved = useApi && job._api ? favoriteIds.has(id) : savedJobIds.has(rowId);
          const isApplied = useApi && job._api ? appliedJobIds.has(id) : appliedJobIds.has(rowId);
          return (
            <li key={id} className="vac-job-row" data-role={role} data-company={job.company} data-location={city}>
              <img
                className="vac-job-row__logo"
                src={`https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(job.seed || job.company)}`}
                width="44"
                height="44"
                alt=""
              />
              <div className="vac-job-row__main">
                <p className="vac-job-row__title">{`${role} — ${job.company} — ${city}`}</p>
                <p className="vac-job-row__salary">{formatSalary(job.salaryMin, job.salaryMax)}</p>
                <p className="vac-job-row__meta">{formatPosted(job.postedDays)}</p>
                <p className="vac-job-row__desc">{jobDesc(job)}</p>
                <div className="vac-job-row__tags">
                  {(job.tags || []).map((tag) => (
                    <span key={`${id}-${tag}`} className="vac-job-row__tag">
                      {t(`vac.tag.${String(tag).toLowerCase().replace(/[^a-z0-9]+/g, "_")}`, tag)}
                    </span>
                  ))}
                </div>
                <div className="vac-job-row__actions">
                  <button
                    type="button"
                    className="vac-job-row__cta"
                    disabled={isApplied}
                    aria-disabled={isApplied ? "true" : "false"}
                    onClick={() => {
                      if (!isApplied) openApplyModalFor(job);
                    }}
                  >
                    {isApplied ? t("vac.applied", "Applied") : t("vac.apply", "Apply")}
                  </button>
                  <button
                    type="button"
                    className={isSaved ? "vac-job-row__save vac-job-row__save--active" : "vac-job-row__save"}
                    aria-pressed={isSaved ? "true" : "false"}
                    onClick={() => handleSave(job)}
                  >
                    {isSaved ? t("vac.saved", "Saved") : t("vac.save", "Save")}
                  </button>
                </div>
              </div>
              <button
                type="button"
                className="vac-job-row__dismiss"
                onClick={() => {
                  if (job.userPosted) {
                    setPostedJobs((prev) => {
                      const next = prev.filter((entry) => String(entry.id) !== id);
                      writePostedJobs(next);
                      return next;
                    });
                  }
                }}
              >
                ×
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <section className="page vacancies-page-legacy">
      <div className="home-shell home-shell--vacancies home-shell--jobs">
        <aside className="home-col-left home-card vac-jobs-sidebar">
          <nav className="vac-jobs-nav" aria-label={t("vac.nav.aria", "Job sections")}>
            {VAC_JOBS_NAV.map((item) => {
              const isActive = mode === item.id;
              const onSelect =
                item.id === "saved"
                  ? openSavedVacancies
                  : () => setMode(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={
                    isActive
                      ? `vac-jobs-nav__link vac-jobs-nav__link--active vac-jobs-nav__link--${item.icon}`
                      : `vac-jobs-nav__link vac-jobs-nav__link--${item.icon}`
                  }
                  onClick={onSelect}
                >
                  <span className={`vac-jobs-nav__icon vac-jobs-nav__icon--${item.icon}`} aria-hidden="true">
                    <VacJobsNavIcon type={item.icon} />
                  </span>
                  <span className="vac-jobs-nav__label">{t(item.labelKey, item.fallback)}</span>
                </button>
              );
            })}
          </nav>
          <button type="button" className="vac-jobs-post" onClick={() => setPostModalOpen(true)}>
            <span className="vac-jobs-post__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
            </span>
            <span>{t("vac.postJob", "Post a job")}</span>
          </button>
        </aside>

        <main className="home-col-feed vac-jobs-feed">
          {mode === "browse" && (
            <>
              <section className="home-card vac-advanced-search" id="vacAdvancedSearch">
                <header className="vac-advanced-search__head">
                  <div className="vac-advanced-search__head-row">
                    <div className="vac-advanced-search__head-text">
                      <h2 className="vac-advanced-search__title">{t("vac.search.title", "Advanced job search")}</h2>
                      <p className="vac-advanced-search__subtitle">
                        {t("vac.search.subtitle", "Filter by role, location, work type, seniority, and salary — like LinkedIn.")}
                      </p>
                    </div>
                  </div>
                  <p className="vac-advanced-search__stats-bar">{tmpl("vac.search.found", { found: filtered.length, total: allJobs.length }, `Found: ${filtered.length} of ${allJobs.length} jobs`)}</p>
                </header>
                <div className="vac-advanced-search__body">
                  <div className="vac-advanced-search__body-inner">
                    <form
                      className="vac-advanced-search__form"
                      onSubmit={(event) => event.preventDefault()}
                    >
                      <label className="vac-field vac-field--query">
                        <span>{t("vac.field.keywords", "Keywords")}</span>
                        <input
                          type="search"
                          placeholder={t("vac.placeholder.keywords", "e.g. Frontend Developer, DevOps, React")}
                          value={query}
                          onChange={(event) => setQuery(event.target.value)}
                        />
                      </label>
                      <label className="vac-field vac-field--location">
                        <span>{t("vac.field.location", "Location")}</span>
                        <input
                          type="text"
                          placeholder={t("vac.placeholder.location", "Remote, Toronto, San Francisco")}
                          value={location}
                          onChange={(event) => setLocation(event.target.value)}
                        />
                      </label>
                      <label className="vac-field">
                        <span>{t("vac.field.employment", "Employment type")}</span>
                        <select value={jobType} onChange={(event) => setJobType(event.target.value)}>
                          <option value="">{t("vac.any", "Any")}</option>
                          <option value="full-time">{t("vac.type.full", "Full-time")}</option>
                          <option value="part-time">{t("vac.type.part", "Part-time")}</option>
                          <option value="contract">{t("vac.type.contract", "Contract")}</option>
                          <option value="internship">{t("vac.type.internship", "Internship")}</option>
                        </select>
                      </label>
                      <label className="vac-field">
                        <span>{t("vac.field.seniority", "Seniority")}</span>
                        <select value={jobLevel} onChange={(event) => setJobLevel(event.target.value)}>
                          <option value="">{t("vac.any", "Any")}</option>
                          <option value="entry">{t("vac.level.entry", "Junior / Entry")}</option>
                          <option value="middle">{t("vac.level.middle", "Middle")}</option>
                          <option value="senior">{t("vac.level.senior", "Senior")}</option>
                          <option value="lead">{t("vac.level.lead", "Lead")}</option>
                        </select>
                      </label>
                      <label className="vac-field">
                        <span>{t("vac.field.minSalary", "Min. salary (k $/year)")}</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          placeholder={t("vac.placeholder.minSalary", "e.g. 80")}
                          value={salaryMin}
                          onChange={(event) => setSalaryMin(event.target.value)}
                        />
                      </label>
                      <label className="vac-field">
                        <span>{t("vac.field.sortBy", "Sort by")}</span>
                        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                          <option value="relevance">{t("vac.sort.relevance", "Relevance")}</option>
                          <option value="salary_desc">{t("vac.sort.salaryDesc", "Salary ↓")}</option>
                          <option value="salary_asc">{t("vac.sort.salaryAsc", "Salary ↑")}</option>
                          <option value="newest">{t("vac.sort.newest", "Newest first")}</option>
                        </select>
                      </label>
                      <div className="vac-advanced-search__form-footer">
                        <label className="vac-advanced-search__checkbox">
                          <input
                            type="checkbox"
                            checked={remoteOnly}
                            onChange={(event) => setRemoteOnly(event.target.checked)}
                          />
                          <span>{t("vac.remoteOnly", "Remote only")}</span>
                        </label>
                        <div className="vac-advanced-search__actions">
                          <button type="button" className="vac-advanced-search__btn vac-advanced-search__btn--primary">
                            {t("vac.applyFilters", "Apply filters")}
                          </button>
                          <button
                            type="button"
                            className="vac-advanced-search__btn"
                            onClick={() => {
                              setQuery("");
                              setLocation("");
                              setJobType("");
                              setJobLevel("");
                              setSalaryMin("");
                              setSortBy("relevance");
                              setRemoteOnly(false);
                            }}
                          >
                            {t("vac.reset", "Reset")}
                          </button>
                        </div>
                      </div>
                    </form>
                    <div className="vac-advanced-search__quick">
                      {["react", "python", "devops", "remote"].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          className="vac-quick-chip"
                          onClick={() => {
                            if (chip === "remote") setRemoteOnly(true);
                            else setQuery(chip);
                          }}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="home-card vac-job-card vac-job-card--queries">
                <h2 className="vac-job-card__title vac-job-card__title--sm">{t("vac.quickFilters", "Quick filters")}</h2>
                <p className="vac-job-card__subtitle vac-job-card__subtitle--sm">
                  {t("vac.quickFiltersSub", "Tap a tag to instantly filter job listings.")}
                </p>
                <div className="vac-query-pills">
                  {["React", "Frontend", "Python", "DevOps", "TypeScript", "Kubernetes", "Machine learning", "Go", "Senior", "Remote"].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      className="vac-query-pill"
                      onClick={() => {
                        if (chip.toLowerCase() === "senior") setJobLevel("senior");
                        else if (chip.toLowerCase() === "remote") setRemoteOnly(true);
                        else setQuery(chip.toLowerCase());
                      }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </section>

              <section className="home-card vac-job-card">
                <header className="vac-job-card__header">
                  <h2 className="vac-job-card__title">{t("vac.topPicks", "Top job picks")}</h2>
                  <p className="vac-job-card__subtitle">{t("vac.topPicksSub", "Based on your profile, settings, and activity.")}</p>
                </header>
                <JobList jobs={topJobs} />
                <button
                  type="button"
                  className="vac-job-card__footer-link"
                  onClick={() => focusJobSearch({ clearFilters: true })}
                >
                  <span>{t("vac.showAll", "Show all")}</span> <span aria-hidden="true">→</span>
                </button>
              </section>

              <section className="home-card vac-job-card">
                <header className="vac-job-card__header">
                  <h2 className="vac-job-card__title">{t("vac.itTech", "IT & Tech jobs")}</h2>
                  <p className="vac-job-card__subtitle">
                    {t("vac.itTechSub", "Software engineering, data, cloud, security, and product roles.")}
                  </p>
                </header>
                <JobList jobs={itJobs} />
                <button
                  type="button"
                  className="vac-job-card__footer-link"
                  onClick={() => focusJobSearch({ searchQuery: "developer" })}
                >
                  <span>{t("vac.showAll", "Show all")}</span> <span aria-hidden="true">→</span>
                </button>
              </section>

              <section className="home-card vac-user-hub" id="vacUserHub">
                <header className="vac-user-hub__head">
                  <h2 className="vac-user-hub__title">{t("vac.myActivity", "My activity")}</h2>
                  <div className="vac-user-hub__tabs">
                    <button
                      type="button"
                      className={activityTab === "applied" ? "vac-user-hub__tab vac-user-hub__tab--active" : "vac-user-hub__tab"}
                      onClick={() => setActivityTab("applied")}
                    >
                      {t("vac.myApplied", "My applied")}
                    </button>
                    <button
                      type="button"
                      className={activityTab === "saved" ? "vac-user-hub__tab vac-user-hub__tab--active" : "vac-user-hub__tab"}
                      onClick={() => setActivityTab("saved")}
                    >
                      {t("vac.mySaved", "Saved")}
                    </button>
                  </div>
                </header>
                {activityTab === "applied" ? (
                  appliedJobs.length ? (
                    <ul className="vac-user-hub__list">
                      {appliedJobs.map((item) => (
                        <li key={`applied-${item.id}`} className="vac-user-hub__item">
                          <strong>{`${item.role || "Role"} — ${item.company || "Company"}`}</strong>
                          <span>
                            {`${item.location || ""} · ${t("vac.appliedOn", "Applied on")}: ${formatDate(item.submittedAt)}`}
                          </span>
                          <span>{`${t("vac.resume", "Resume")}: ${item.resumeName || "—"}`}</span>
                          <div className="vac-user-hub__item-actions">
                            <button type="button" className="vac-user-hub__btn" onClick={() => handleWithdrawApplication(item.id)}>
                              {t("vac.withdraw", "Withdraw")}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="vac-user-hub__empty">{t("vac.emptyApplied", "You have not applied yet.")}</p>
                  )
                ) : savedJobs.length ? (
                  <ul className="vac-user-hub__list">
                    {savedJobs.map((item) => (
                      <li key={`saved-${item.id}`} className="vac-user-hub__item">
                        <strong>{`${item.role || "Role"} — ${item.company || "Company"}`}</strong>
                        <span>{`${item.location || ""} · ${item.salary || "—"}`}</span>
                        <span>{item.meta || ""}</span>
                        <div className="vac-user-hub__item-actions">
                          <button type="button" className="vac-user-hub__btn" onClick={() => handleRemoveSaved(item.id)}>
                            {t("vac.removeSaved", "Remove")}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="vac-user-hub__empty">{t("vac.emptySaved", "No saved jobs yet.")}</p>
                )}
              </section>
            </>
          )}

          {mode === "mine" && (
            <section className="home-card vac-job-card" id="vacMyJobsCard">
              <header className="vac-job-card__header">
                <h2 className="vac-job-card__title">{t("vac.myPosted", "My posted jobs")}</h2>
                <p className="vac-job-card__subtitle">{t("vac.myPostedSub", "Vacancies you created with Post a job.")}</p>
              </header>
              {myJobs.length > 0 ? (
                <JobList jobs={myJobs} />
              ) : (
                <div className="vac-my-jobs-empty">
                  <p>{t("vac.emptyPosted", "You haven't posted any jobs yet. Create your first listing.")}</p>
                  <button type="button" className="vac-jobs-post vac-jobs-post--inline" onClick={() => setPostModalOpen(true)}>
                    <span>{t("vac.postJob", "Post a job")}</span>
                  </button>
                </div>
              )}
            </section>
          )}

          {mode === "saved" && (
            <section className="home-card vac-job-card" id="vacSavedJobsCard">
              <header className="vac-job-card__header">
                <h2 className="vac-job-card__title">{t("vac.nav.savedJobs", "Saved vacancies")}</h2>
                <p className="vac-job-card__subtitle">{t("vac.emptySaved", "No saved jobs yet.")}</p>
              </header>
              {savedJobs.length ? (
                <ul className="vac-user-hub__list">
                  {savedJobs.map((item) => (
                    <li key={`saved-mode-${item.id}`} className="vac-user-hub__item">
                      <strong>{`${item.role || "Role"} — ${item.company || "Company"}`}</strong>
                      <span>{`${item.location || ""} · ${item.salary || "—"}`}</span>
                      <span>{item.meta || ""}</span>
                      <div className="vac-user-hub__item-actions">
                        <button type="button" className="vac-user-hub__btn" onClick={() => handleRemoveSaved(item.id)}>
                          {t("vac.removeSaved", "Remove")}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="vac-my-jobs-empty">
                  <p>{t("vac.emptySaved", "No saved jobs yet.")}</p>
                </div>
              )}
            </section>
          )}
        </main>

        <aside className="home-col-right home-card home-messages">
          <div className="home-messages__head">
            <h2 className="home-messages__title">{t("vac.messages.title", "Messages")}</h2>
          </div>
          <input className="home-messages__search" type="search" placeholder={t("vac.messages.search", "Search messages")} />
          <div className="home-messages__list">
            {chats.length > 0 ? (
              chats.map((chat) => (
                <button key={chat.id} type="button" className="home-messages__item" onClick={() => navigate("/chat")}>
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(chat.peer)}`} width="34" height="34" alt="" />
                  <span>
                    <strong>{chat.peer}</strong>
                    <small>{chat.messages?.[chat.messages.length - 1]?.text || t("vac.messages.noneYet", "No messages yet")}</small>
                  </span>
                </button>
              ))
            ) : (
              <div className="home-messages__empty">
                <p>{t("vac.messages.empty", "No messages yet. Send one to start a conversation.")}</p>
                <button type="button" className="home-messages__cta" onClick={() => navigate("/chat")}>
                  {t("vac.messages.write", "Write a message")}
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {postModalOpen && (
        <div className="vac-apply-modal">
          <div className="vac-apply-modal__backdrop" onClick={() => setPostModalOpen(false)} />
          <section className="vac-apply-modal__dialog vac-apply-modal__dialog--wide">
            <button type="button" className="vac-apply-modal__close" onClick={() => setPostModalOpen(false)}>
              ×
            </button>
            <header className="vac-apply-modal__head">
              <h3 className="vac-apply-modal__title">{t("vac.postJob", "Post a job")}</h3>
              <p className="vac-apply-modal__subtitle">
                {t("vac.postJobSub", "Create a new listing — it appears in job picks right away.")}
              </p>
            </header>
            <form
              className="vac-apply-modal__form"
              onSubmit={handlePostSubmit}
            >
              <label className="vac-apply-modal__field">
                <span>{t("vac.field.jobTitle", "Job title")}</span>
                <input
                  type="text"
                  required
                  placeholder={t("vac.placeholder.jobTitle", "e.g. Frontend Developer")}
                  value={postForm.role}
                  onChange={(event) => setPostForm((prev) => ({ ...prev, role: event.target.value }))}
                />
              </label>
              <label className="vac-apply-modal__field">
                <span>{t("vac.field.company", "Company")}</span>
                <input
                  type="text"
                  required
                  placeholder={t("vac.placeholder.company", "e.g. Acme Inc")}
                  value={postForm.company}
                  onChange={(event) => setPostForm((prev) => ({ ...prev, company: event.target.value }))}
                />
              </label>
              <label className="vac-apply-modal__field">
                <span>{t("vac.field.location", "Location")}</span>
                <input
                  type="text"
                  required
                  placeholder={t("vac.placeholder.postLocation", "Remote, Kyiv, Berlin…")}
                  value={postForm.location}
                  onChange={(event) => setPostForm((prev) => ({ ...prev, location: event.target.value }))}
                />
              </label>
              <label className="vac-apply-modal__field">
                <span>{t("vac.field.employment", "Employment type")}</span>
                <select value={postForm.type} onChange={(event) => setPostForm((prev) => ({ ...prev, type: event.target.value }))}>
                  <option value="full-time">{t("vac.type.full", "Full-time")}</option>
                  <option value="part-time">{t("vac.type.part", "Part-time")}</option>
                  <option value="contract">{t("vac.type.contract", "Contract")}</option>
                  <option value="internship">{t("vac.type.internship", "Internship")}</option>
                </select>
              </label>
              <label className="vac-apply-modal__field">
                <span>{t("vac.field.seniority", "Seniority")}</span>
                <select value={postForm.level} onChange={(event) => setPostForm((prev) => ({ ...prev, level: event.target.value }))}>
                  <option value="entry">{t("vac.level.entry", "Junior / Entry")}</option>
                  <option value="middle">{t("vac.level.middle", "Middle")}</option>
                  <option value="senior">{t("vac.level.senior", "Senior")}</option>
                  <option value="lead">{t("vac.level.lead", "Lead")}</option>
                </select>
              </label>
              <label className="vac-apply-modal__field">
                <span>{t("vac.field.workFormat", "Work format")}</span>
                <select value={postForm.remote} onChange={(event) => setPostForm((prev) => ({ ...prev, remote: event.target.value }))}>
                  <option value="yes">{t("vac.remote", "Remote")}</option>
                  <option value="hybrid">{t("vac.hybrid", "Hybrid")}</option>
                  <option value="no">{t("vac.onsite", "On-site")}</option>
                </select>
              </label>
              <label className="vac-apply-modal__field">
                <span>{t("vac.field.minSalary", "Min. salary (k $/year)")}</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder={t("vac.placeholder.minSalary", "e.g. 80")}
                  value={postForm.salaryMin}
                  onChange={(event) => setPostForm((prev) => ({ ...prev, salaryMin: event.target.value }))}
                />
              </label>
              <label className="vac-apply-modal__field">
                <span>{t("vac.field.maxSalary", "Max. salary (k $/year)")}</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder={t("vac.placeholder.maxSalary", "e.g. 120")}
                  value={postForm.salaryMax}
                  onChange={(event) => setPostForm((prev) => ({ ...prev, salaryMax: event.target.value }))}
                />
              </label>
              <label className="vac-apply-modal__field">
                <span>{t("vac.field.jobDescription", "Job description")}</span>
                <textarea
                  rows={4}
                  placeholder={t("vac.placeholder.jobDescription", "Describe responsibilities, stack, and requirements…")}
                  value={postForm.desc}
                  onChange={(event) => setPostForm((prev) => ({ ...prev, desc: event.target.value }))}
                />
              </label>
              <label className="vac-apply-modal__field">
                <span>{t("vac.field.keywordsOptional", "Keywords (optional)")}</span>
                <input
                  type="text"
                  placeholder={t("vac.placeholder.keywordsShort", "react, typescript, remote")}
                  value={postForm.keywords}
                  onChange={(event) => setPostForm((prev) => ({ ...prev, keywords: event.target.value }))}
                />
              </label>
              <div className="vac-apply-modal__actions">
                <button type="button" className="vac-apply-modal__btn vac-apply-modal__btn--ghost" onClick={() => setPostModalOpen(false)}>
                  {t("vac.cancel", "Cancel")}
                </button>
                <button type="submit" className="vac-apply-modal__btn vac-apply-modal__btn--primary">
                  {t("vac.publishJob", "Publish job")}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {applyModalOpen && (
        <div className="vac-apply-modal">
          <div className="vac-apply-modal__backdrop" onClick={() => setApplyModalOpen(false)} />
          <section className="vac-apply-modal__dialog">
            <button type="button" className="vac-apply-modal__close" onClick={() => setApplyModalOpen(false)}>
              ×
            </button>
            <header className="vac-apply-modal__head">
              <h3 className="vac-apply-modal__title">{t("vac.quickApply", "Quick apply")}</h3>
              <p className="vac-apply-modal__subtitle">
                {activeJobForApply
                  ? `${activeJobForApply.role || activeJobForApply.title} · ${activeJobForApply.company} · ${formatSalary(
                      activeJobForApply.salaryMin,
                      activeJobForApply.salaryMax,
                    )}`
                  : "—"}
              </p>
            </header>
            <form
              className="vac-apply-modal__form"
              onSubmit={(event) => {
                event.preventDefault();
                if (!activeJobForApply) return;
                const fullName = String(applyForm.fullName || "").trim();
                const email = String(applyForm.email || "").trim();
                if (!fullName || !email) {
                  setApplyError(t("vac.applyFillRequired", "Fill in required fields"));
                  return;
                }
                if (!selectedResumeData) {
                  setApplyError(t("vac.applyNeedResume", "Attach a resume before submitting"));
                  return;
                }
                const rowId = getRowJobId(activeJobForApply);
                const submitLocal = () => {
                  const entry = {
                    id: rowId,
                    role: String(activeJobForApply.role || activeJobForApply.title || "").trim(),
                    company: String(activeJobForApply.company || "").trim(),
                    location: String(activeJobForApply.location || activeJobForApply.city || "").trim(),
                    fullName,
                    email,
                    phone: String(applyForm.phone || "").trim(),
                    about: String(applyForm.about || "").trim(),
                    resumeName: selectedResumeName || "resume",
                    submittedAt: new Date().toISOString(),
                  };
                  setApplicationsMap((prev) => {
                    const next = { ...prev, [rowId]: entry };
                    writeApplications(next);
                    return next;
                  });
                  saveResumeToProfile(selectedResumeName, selectedResumeData);
                  setApplyModalOpen(false);
                  notify(`${t("vac.applyDone", "Application sent")}: ${entry.role}`);
                };

                if (useApi && activeJobForApply._api) {
                  jobsApi
                    .applyToVacancy(String(activeJobForApply.id))
                    .then(() => reloadVacancies())
                    .then(() => {
                      saveResumeToProfile(selectedResumeName, selectedResumeData);
                      setApplyModalOpen(false);
                      notify(`${t("vac.applyDone", "Application sent")}: ${activeJobForApply.role || activeJobForApply.title}`);
                    })
                    .catch(() => setApplyError(t("vac.applyFailed", "Failed to submit application.")));
                  return;
                }
                submitLocal();
              }}
            >
              <label className="vac-apply-modal__field">
                <span>{t("vac.field.fullName", "Full name")}</span>
                <input
                  type="text"
                  required
                  value={applyForm.fullName}
                  onChange={(event) => setApplyForm((prev) => ({ ...prev, fullName: event.target.value }))}
                />
              </label>
              <label className="vac-apply-modal__field">
                <span>{t("auth.field.email", "Email")}</span>
                <input
                  type="email"
                  required
                  value={applyForm.email}
                  onChange={(event) => setApplyForm((prev) => ({ ...prev, email: event.target.value }))}
                />
              </label>
              <label className="vac-apply-modal__field">
                <span>{t("vac.field.phone", "Phone")}</span>
                <input
                  type="tel"
                  value={applyForm.phone}
                  onChange={(event) => setApplyForm((prev) => ({ ...prev, phone: event.target.value }))}
                />
              </label>
              <label className="vac-apply-modal__field">
                <span>{t("vac.field.whyFit", "Why you are a fit")}</span>
                <textarea
                  rows={4}
                  placeholder={t("vac.placeholder.whyFit", "Briefly describe your relevant experience...")}
                  value={applyForm.about}
                  onChange={(event) => setApplyForm((prev) => ({ ...prev, about: event.target.value }))}
                />
              </label>
              <div className="vac-apply-modal__field">
                <span>{t("vac.resume", "Resume")}</span>
                <p className="vac-apply-modal__resume-name">
                  {selectedResumeName || t("vac.applyResumeEmpty", "No file selected")}
                </p>
                <div className="vac-apply-modal__actions vac-apply-modal__actions--inline">
                  <button
                    type="button"
                    className="vac-apply-modal__btn vac-apply-modal__btn--ghost"
                    onClick={() => {
                      try {
                        const account = readRegisteredAccount();
                        setSelectedResumeName(account.resumeName || "");
                        setSelectedResumeData(account.resumeDataUrl || "");
                        if (account.resumeDataUrl) setApplyError("");
                        else setApplyError(t("vac.applyNoSavedResume", "Saved resume is not available yet"));
                      } catch {
                        setApplyError(t("vac.applyNoSavedResume", "Saved resume is not available yet"));
                      }
                    }}
                  >
                    {t("vac.applyUseSavedResume", "Use saved")}
                  </button>
                  <label className="vac-apply-modal__btn vac-apply-modal__btn--ghost">
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        event.target.value = "";
                        if (file.size > MAX_RESUME_SIZE) {
                          setApplyError(t("vac.applyResumeTooLarge", "File is too large (up to 1.8MB)"));
                          return;
                        }
                        try {
                          const dataUrl = await readFileAsDataUrl(file);
                          setSelectedResumeName(file.name || "resume");
                          setSelectedResumeData(dataUrl);
                          setApplyError("");
                        } catch {
                          setApplyError(t("vac.applyResumeReadFail", "Failed to read resume file"));
                        }
                      }}
                    />
                    {t("vac.applyUploadResume", "Upload")}
                  </label>
                </div>
              </div>
              {applyError ? <p className="vac-apply-modal__error">{applyError}</p> : null}
              <div className="vac-apply-modal__actions">
                <button type="button" className="vac-apply-modal__btn vac-apply-modal__btn--ghost" onClick={() => setApplyModalOpen(false)}>
                  {t("vac.cancel", "Cancel")}
                </button>
                <button type="submit" className="vac-apply-modal__btn vac-apply-modal__btn--primary">
                  {t("vac.submitApply", "Submit application")}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
