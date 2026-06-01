(function () {
  "use strict";

  function t(key, fallback) {
    return typeof window.uiT === "function" ? window.uiT(key, fallback) : fallback || key;
  }

  function tmpl(key, vars, fallback) {
    return typeof window.uiTmpl === "function" ? window.uiTmpl(key, vars) : fallback || key;
  }

  function formatSalary(min, max) {
    if (min && max) return "$" + min + "k — $" + max + "k / year";
    if (min) return "$" + min + "k+ / year";
    return "";
  }

  function formatPosted(days) {
    var n = Number(days) || 0;
    if (n <= 1) return t("vac.meta.dayAgo", "1 day ago");
    if (n < 7) return tmpl("vac.meta.daysAgo", { n: n }, n + " days ago");
    if (n < 14) return t("vac.meta.weekAgo", "1 week ago");
    return tmpl("vac.meta.weeksAgo", { n: Math.floor(n / 7) }, Math.floor(n / 7) + " weeks ago");
  }

  var IT_JOBS = [
    {
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

  function getLang() {
    return typeof window.getUiLang === "function" ? window.getUiLang() : "en";
  }

  function jobDesc(job) {
    var lang = getLang();
    var d = job.desc || {};
    if (typeof d === "string") return d;
    return d[lang] || d.en || "";
  }

  var POSTED_JOBS_KEY = "vacancyPostedJobs";

  function readPostedJobs() {
    try {
      var raw = localStorage.getItem(POSTED_JOBS_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function getAllJobs() {
    return readPostedJobs().concat(IT_JOBS);
  }

  function buildJobRow(job) {
    var li = document.createElement("li");
    li.className = "vac-job-row";
    li.setAttribute("data-role", job.role);
    li.setAttribute("data-company", job.company);
    li.setAttribute("data-location", job.location);
    li.setAttribute("data-type", job.type);
    li.setAttribute("data-level", job.level);
    li.setAttribute("data-remote", job.remote);
    li.setAttribute("data-salary-min", String(job.salaryMin || ""));
    li.setAttribute("data-posted-days", String(job.postedDays || ""));
    li.setAttribute("data-keywords", job.keywords || "");
    li.setAttribute("data-seed", job.seed || job.company);
    if (job.userPosted) li.setAttribute("data-user-posted", "true");

    var title = job.role + " — " + job.company + " — " + job.location;
    var salary = formatSalary(job.salaryMin, job.salaryMax);
    var posted = formatPosted(job.postedDays);
    var tagsHtml = (job.tags || [])
      .map(function (tag) {
        return '<span class="vac-job-row__tag">' + tag + "</span>";
      })
      .join("");

    li.innerHTML =
      '<img class="vac-job-row__logo" src="https://api.dicebear.com/7.x/shapes/svg?seed=' +
      encodeURIComponent(job.seed || job.company) +
      '" width="44" height="44" alt="" />' +
      '<div class="vac-job-row__main">' +
      '<p class="vac-job-row__title">' +
      title +
      "</p>" +
      '<p class="vac-job-row__salary">' +
      salary +
      "</p>" +
      '<p class="vac-job-row__meta">' +
      posted +
      "</p>" +
      '<p class="vac-job-row__desc">' +
      jobDesc(job) +
      "</p>" +
      '<div class="vac-job-row__tags">' +
      tagsHtml +
      "</div>" +
      '<div class="vac-job-row__actions">' +
      '<a class="vac-job-row__cta" href="#" data-vac-apply data-i18n="vac.apply">Apply</a>' +
      '<button type="button" class="vac-job-row__save" data-vac-save data-i18n="vac.save">Save</button>' +
      "</div>" +
      "</div>" +
      '<button type="button" class="vac-job-row__dismiss" data-i18n-aria="vac.dismiss">×</button>';

    return li;
  }

  function renderJobs(containerId, jobs) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    jobs.forEach(function (job) {
      container.appendChild(buildJobRow(job));
    });
    if (typeof window.applyDomTranslations === "function") {
      window.applyDomTranslations();
    }
  }

  function renderAll() {
    var all = getAllJobs();
    renderJobs("vacTopJobsList", all.slice(0, 5));
    renderJobs("vacItJobsList", all.slice(5));
    document.dispatchEvent(new CustomEvent("vacjobsrendered"));
  }

  window.savePostedVacancyJob = function (job) {
    var list = readPostedJobs();
    list.unshift(job);
    try {
      localStorage.setItem(POSTED_JOBS_KEY, JSON.stringify(list));
    } catch (e) {
      /* ignore */
    }
    renderAll();
  };

  window.VAC_IT_JOBS = IT_JOBS;
  window.renderVacancyJobs = renderAll;
  window.getPostedVacancyJobs = readPostedJobs;
  window.renderVacancyJobsForList = renderJobs;
  window.renderMyPostedJobs = function () {
    var posted = readPostedJobs();
    renderJobs("vacMyJobsList", posted);
    var empty = document.getElementById("vacMyJobsEmpty");
    var list = document.getElementById("vacMyJobsList");
    if (empty) empty.hidden = posted.length > 0;
    if (list) list.hidden = posted.length === 0;
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderAll);
  } else {
    renderAll();
  }

  document.addEventListener("uilangchange", renderAll);
})();
