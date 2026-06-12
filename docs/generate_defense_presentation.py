import re
from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_AUTO_SHAPE_TYPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.util import Inches, Pt

ROOT_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DOCS_FILE = Path(__file__).resolve().parent / "LinkedIn_Diploma_Presentation_UA.pptx"
OUTPUT_ROOT_FILE = ROOT_DIR / "presentation.pptx"

WHITE = RGBColor(255, 255, 255)
BG_DARK = RGBColor(7, 11, 20)
BG_DARK_2 = RGBColor(11, 18, 32)
CARD = RGBColor(18, 26, 43)
CARD_SOFT = RGBColor(27, 38, 59)
CARD_LIGHT = RGBColor(36, 50, 75)
BLUE = RGBColor(10, 102, 194)
BLUE_SOFT = RGBColor(42, 64, 96)
CYAN = RGBColor(56, 189, 248)
GREEN = RGBColor(52, 211, 153)
ORANGE = RGBColor(251, 146, 60)
PURPLE = RGBColor(139, 92, 246)
PURPLE_SOFT = RGBColor(196, 181, 253)
TEXT = RGBColor(238, 242, 247)
TEXT_MUTED = RGBColor(148, 163, 184)
BORDER = RGBColor(51, 65, 85)

NAV_ITEMS = [
    ("home", "Головна"),
    ("network", "Мережа"),
    ("vacancies", "Вакансії"),
    ("chat", "Чат"),
    ("profile", "Профіль"),
]

SLIDES = [
    {
        "type": "cover",
        "focus": None,
        "title": "LinkedIn Diplom Project",
        "subtitle": "Платформа професійного нетворкінгу, пошуку роботи та комунікації",
        "facts": [
            "Дипломний проєкт: LinkedIn-like MVP",
            "Frontend: Ямчук Тимур, Андрій Ротарь",
            "Backend: Гребенчук Марія, Прохорова Валерія",
            "React/Vite + ASP.NET Core .NET 8 + PostgreSQL",
            "Рік захисту: 2026",
        ],
    },
    {
        "type": "statement",
        "focus": None,
        "title": "1. Актуальність теми",
        "headline": "Ринок потребує не просто дошки вакансій, а цілісної професійної екосистеми.",
        "points": [
            "Кандидатам потрібні профіль, мережа контактів, контент, вакансії та комунікація в одному місці.",
            "Роботодавцям важливо бачити не лише резюме, а й професійну активність користувача.",
            "Локальні job-board часто відокремлюють пошук роботи від нетворкінгу та обміну досвідом.",
        ],
        "metric": "5",
        "metric_label": "ключових сценаріїв об'єднано в одному MVP",
    },
    {
        "type": "statement",
        "focus": None,
        "title": "Обґрунтування вибору LinkedIn-like формату",
        "headline": "LinkedIn обрано як модель, бо він поєднує роботу, професійну репутацію, контент і контакти в одному продукті.",
        "points": [
            "Такий формат дозволяє показати не одну сторінку вакансій, а повноцінну систему з різними ролями користувачів.",
            "Для дипломного проєкту це сильніше за простий job-board: є frontend, backend, база даних, авторизація та інтеграція модулів.",
            "Користувацький шлях легко демонструвати на захисті: вхід, профіль, стрічка, мережа, вакансії, чат.",
        ],
        "metric": "6",
        "metric_label": "робочих розділів сайту демонструють цілісний продукт",
    },
    {
        "type": "comparison",
        "focus": None,
        "title": "Перевага LinkedIn Clone над конкурентами",
        "left_title": "Конкуренти та типові аналоги",
        "right_title": "LinkedIn Clone у цьому проєкті",
        "left": [
            "Job-board часто обмежується списком вакансій і формою відгуку.",
            "Профіль кандидата існує окремо від контенту та комунікації.",
            "Чати, спільноти й події зазвичай винесені в інші сервіси.",
            "Демо часто показує UI без повної прив'язки до backend API.",
        ],
        "right": [
            "Один сайт об'єднує вакансії, профіль, стрічку, мережу, чати та сповіщення.",
            "Профіль працює як професійна візитка з навичками, досвідом і резюме.",
            "Спільноти, сторінки, events і messaging створюють довгострокову взаємодію.",
            "Frontend інтегрований з .NET API, JWT, PostgreSQL і Swagger-контрактами.",
        ],
    },
    {
        "type": "modules",
        "focus": None,
        "title": "Ключові переваги саме нашого сайту",
        "subtitle": "Переваги сформовані з реалізованого коду та доступних екранів продукту",
        "items": [
            ("Єдиний UX", "всі сценарії в одному інтерфейсі"),
            ("Реальний API", "auth, profile, jobs, feed, messaging"),
            ("Гнучкий demo", "backend або локальні fallback-дані"),
            ("Сучасний UI", "dark/light theme, i18n, animations"),
            ("Масштабованість", "модульний моноліт з BFF-шаром"),
            ("Безпека", "JWT, refresh, ролі User/Admin"),
            ("Відтворюваність", "Docker Compose і Swagger"),
            ("Roadmap", "realtime, e2e tests, analytics"),
        ],
    },
    {
        "type": "matrix",
        "focus": None,
        "title": "Команда проєкту та зони відповідальності",
        "left_title": "Frontend розробники",
        "right_title": "Backend розробники",
        "left": [
            "Ямчук Тимур: реєстрація, вакансії, пошук роботи, чати, дизайн і особистий кабінет.",
            "Андрій Ротарь: головний екран, контент, вкладка спільноти та інтеграція frontend з backend.",
            "Frontend-команда відповідає за користувацький шлях і демонстрацію сайту.",
        ],
        "right": [
            "Гребенчук Марія: backend-частина доменних модулів, API та робота з даними.",
            "Прохорова Валерія: backend-логіка, інтеграція модулів, стабільність API та БД.",
            "Backend-команда забезпечує REST API, PostgreSQL, авторизацію та бізнес-логіку.",
        ],
    },
    {
        "type": "matrix",
        "focus": None,
        "title": "2. Мета і завдання проєкту",
        "left_title": "Мета",
        "right_title": "Завдання",
        "left": [
            "Розробити вебплатформу для професійної взаємодії.",
            "Забезпечити наскрізний шлях користувача від реєстрації до відгуку на вакансію.",
            "Показати готовність архітектури до подальшого масштабування.",
        ],
        "right": [
            "Створити SPA frontend з основними сторінками продукту.",
            "Реалізувати REST API, JWT-auth, модулі профілю, контенту, мережі, вакансій і чатів.",
            "Підготувати Docker Compose, Swagger і базові тести для перевірки рішення.",
        ],
    },
    {
        "type": "modules",
        "focus": None,
        "title": "3. Огляд функціональності продукту",
        "subtitle": "MVP покриває основні сценарії LinkedIn-подібної платформи",
        "items": [
            ("Auth", "реєстрація, login, JWT, refresh"),
            ("Profile", "дані користувача, навички, резюме"),
            ("Feed", "пости, реакції, коментарі, share"),
            ("Network", "контакти, підписки, групи, сторінки"),
            ("Jobs", "пошук, фільтри, apply, saved"),
            ("Messaging", "чати, unread, AI assistant"),
            ("Notifications", "події та прочитані стани"),
            ("Admin", "ролі, модерація, статистика"),
        ],
    },
    {
        "type": "comparison",
        "focus": None,
        "title": "4. Порівняння з ринковими аналогами",
        "left_title": "Типовий job-board",
        "right_title": "Наш LinkedIn-like MVP",
        "left": [
            "Вакансії як головний і майже єдиний сценарій.",
            "Профіль кандидата обмежений резюме.",
            "Комунікація часто переноситься в зовнішні месенджери.",
            "Мало контенту, спільнот і професійної взаємодії.",
        ],
        "right": [
            "Вакансії + профіль + мережа + контент + чат.",
            "Профіль містить навички, досвід, освіту, резюме та avatar/upload.",
            "Комунікація проходить через `/api/messaging/*` всередині платформи.",
            "Є groups, pages, events і глобальний пошук по продукту.",
        ],
    },
    {
        "type": "stack",
        "focus": None,
        "title": "5. Технологічний стек",
        "groups": [
            ("Frontend", ["React 19", "Vite 6", "React Router 7", "Context API", "CSS variables"]),
            ("Backend", ["ASP.NET Core .NET 8", "Modular Monolith", "BFF Facade.API", "Swagger/OpenAPI"]),
            ("Data & Security", ["PostgreSQL 16", "EF Core 8", "JWT Bearer", "Refresh tokens"]),
            ("Infra & QA", ["Docker Compose", "Uploads volume", "xUnit + Moq", "EF InMemory tests"]),
        ],
    },
    {
        "type": "architecture",
        "focus": None,
        "title": "6. Загальна архітектура системи",
        "steps": [
            ("React/Vite SPA", "сторінки, routing, state"),
            ("HTTP API Client", "tokens, refresh, errors"),
            ("Facade.API", "BFF controllers + services"),
            ("Core modules", "business logic + clients"),
            ("PostgreSQL", "schema per module"),
        ],
        "note": "Архітектура побудована як microservice-ready modular monolith: один процес зараз, чіткі межі модулів для майбутнього винесення.",
    },
    {
        "type": "modules",
        "focus": None,
        "title": "7. Backend: модульний моноліт + BFF",
        "subtitle": "9 core-модулів і 10 facade-модулів формують близько 200 REST endpoints",
        "items": [
            ("Identity", "користувачі, ролі, JWT"),
            ("Profile", "профілі та перегляди"),
            ("Professional", "досвід, освіта, навички"),
            ("Network", "контакти, групи, сторінки"),
            ("Content", "пости, реакції, hashtags"),
            ("Messaging", "чати та повідомлення"),
            ("Jobs", "вакансії та відгуки"),
            ("Events/Admin", "події, модерація, stats"),
        ],
    },
    {
        "type": "database",
        "focus": None,
        "title": "8. База даних і міграції",
        "schemas": ["identity", "profile", "professional", "network", "content", "messaging", "jobs", "notifications", "events"],
        "points": [
            "PostgreSQL 16 з окремою схемою для кожного доменного модуля.",
            "EF Core migrations запускаються при старті API в контрольованому порядку.",
            "Для завантажених файлів використовується `/uploads` і Docker volume.",
            "Platform Admin реалізовано через JWT role `Admin`, без окремої таблиці адміністраторів.",
        ],
    },
    {
        "type": "security",
        "focus": "profile",
        "title": "9. Безпека та авторизація",
        "points": [
            ("JWT access token", "короткоживучий токен для захищених endpoint-ів"),
            ("Refresh token", "зберігається в PostgreSQL і ротується при refresh"),
            ("Roles", "`User` для звичайних користувачів, `Admin` для `/api/admin/*`"),
            ("Claims", "userId береться з JWT, а не з даних, надісланих клієнтом"),
        ],
    },
    {
        "type": "frontend",
        "focus": "home",
        "title": "10. Frontend: сторінки та UX",
        "routes": [
            ("/auth", "реєстрація, login, social demo"),
            ("/home", "стрічка, composer, mini inbox"),
            ("/network", "контакти, групи, pages/events"),
            ("/vacancies", "вакансії, фільтри, apply"),
            ("/chat", "повідомлення, AI assistant, calls"),
            ("/profile", "профіль, avatar, skills, resume"),
        ],
    },
    {
        "type": "journey",
        "focus": "home",
        "title": "11. Наскрізний сценарій користувача",
        "steps": [
            "Реєстрація або вхід",
            "Заповнення профілю",
            "Перегляд стрічки",
            "Розширення мережі",
            "Пошук вакансій",
            "Чат з контактом",
        ],
        "note": "Цей шлях демонструє, що frontend і backend працюють як одна система, а не як окремі макети.",
    },
    {
        "type": "feature",
        "focus": "vacancies",
        "title": "12. Модуль вакансій",
        "headline": "Сценарій кандидата: знайти, зберегти, відгукнутися та відстежити заявку.",
        "points": [
            "Фільтри за ключовими словами, локацією, типом зайнятості, рівнем досвіду та remote.",
            "Підтримка saved jobs, apply flow, my applications і публікації вакансій.",
            "API-шар використовує `/api/jobs/vacancies` та пов'язані jobs endpoints.",
            "UI готовий для демо як з backend API, так і з локальними fallback-даними.",
        ],
    },
    {
        "type": "feature",
        "focus": "chat",
        "title": "13. Чати та AI-помічник",
        "headline": "Комунікація залишається всередині платформи та доповнюється локальним assistant-сценарієм.",
        "points": [
            "Чати підтримують unread states, archive/mute, видалення повідомлень і share posts.",
            "AI assistant має quick prompts, command chips і навігаційні дії.",
            "Для демо реалізовано call overlay з mute/speaker/end call станами.",
            "Backend-контракт винесено в messaging API, realtime залишено для roadmap.",
        ],
    },
    {
        "type": "feature",
        "focus": "profile",
        "title": "14. Профіль і професійні дані",
        "headline": "Профіль є центром професійної ідентичності користувача.",
        "points": [
            "Редагування профілю, avatar upload/presets, resume upload і visibility settings.",
            "Професійний блок: skills, experience, education, companies, certificates.",
            "ProfileProvider синхронізує frontend state з backend API або локальним fallback.",
            "Профіль використовується у вакансіях, мережі контактів і загальному UX.",
        ],
    },
    {
        "type": "integration",
        "focus": None,
        "title": "15. API-інтеграція frontend і backend",
        "rows": [
            ("Auth", "`/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/me`"),
            ("Profile", "`/api/profile/me`, uploads, settings"),
            ("Content", "`/api/content/me/posts`, comments, reactions, saved"),
            ("Network", "`/api/network/me/contacts`, follows, groups, pages"),
            ("Jobs", "`/api/jobs/vacancies`, applications, favorites"),
            ("Messaging", "`/api/messaging/me/chats`, messages, read status"),
        ],
    },
    {
        "type": "quality",
        "focus": None,
        "title": "16. Тестування та контроль якості",
        "items": [
            ("Build", "`dotnet build LinkedIn.sln`"),
            ("Unit tests", "26 tests: ProfileService, PostService, HashtagService"),
            ("Swagger", "ручна перевірка protected endpoints з Bearer token"),
            ("QA flow", "register/login → profile → feed → network → jobs → chat"),
            ("Frontend build", "`npm run build` для Vite SPA"),
            ("Known gaps", "немає realtime та integration tests у v1"),
        ],
    },
    {
        "type": "infrastructure",
        "focus": None,
        "title": "17. Інфраструктура та запуск",
        "points": [
            ("Frontend", "http://localhost:5173, Vite dev server"),
            ("API", "http://localhost:5000/swagger у Docker або локальний `Facade.API`"),
            ("Database", "PostgreSQL 16, база `linkedin_dev`, порт 5432"),
            ("Docker Compose", "Postgres + API + frontend, healthcheck, env vars, uploads volume"),
        ],
    },
    {
        "type": "roadmap",
        "focus": None,
        "title": "18. Обмеження v1 та план розвитку",
        "steps": [
            ("Realtime", "SignalR для чатів і сповіщень"),
            ("Email flows", "verification, password reset"),
            ("QA", "integration/API tests і e2e сценарії"),
            ("Scale", "outbox/broker для domain events"),
            ("Analytics", "моніторинг, метрики, рекомендації"),
        ],
    },
    {
        "type": "roles",
        "focus": None,
        "title": "Командний внесок frontend",
        "left_title": "Ямчук Тимур",
        "right_title": "Андрій Ротарь",
        "left": [
            "Вікно реєстрації: форма входу, валідація, обробка помилок.",
            "Сторінка вакансій: список, картки, фільтри та відгук.",
            "Пошук роботи, чати, дизайн і особистий кабінет користувача.",
        ],
        "right": [
            "Головний екран: структура першого екрана та навігація.",
            "Контент на сайті: стрічка, взаємодії, візуальна подача.",
            "Вкладка спільноти та злиття backend з frontend.",
        ],
    },
    {
        "type": "feature",
        "focus": "vacancies",
        "title": "Виступ: Ямчук Тимур",
        "headline": "Ямчук Тимур презентує кандидатський шлях: від входу в систему до пошуку роботи та комунікації.",
        "points": [
            "Вікно реєстрації: структура форми, UX авторизації, валідація та повідомлення про помилки.",
            "Сторінка вакансій: картки вакансій, фільтри, збереження та підготовка сценарію відгуку.",
            "Пошук роботи: підбір за параметрами, сценарій без результатів і повторний пошук.",
            "Чати, дизайн і особистий кабінет: єдиний стиль, профіль користувача та комунікація.",
        ],
    },
    {
        "type": "feature",
        "focus": "home",
        "title": "Виступ: Андрій Ротарь",
        "headline": "Андрій Ротарь презентує соціальну частину платформи та інтеграцію frontend з backend.",
        "points": [
            "Головний екран: перший контакт користувача із сайтом, навігація та швидкий доступ до модулів.",
            "Контент на сайті: стрічка постів, взаємодії, лайки, коментарі та оновлення даних.",
            "Вкладка спільноти: контакти, groups, pages, events і розвиток професійної мережі.",
            "Злиття backend з frontend: API-клієнт, proxy, token flow і робота з реальними endpoint-ами.",
        ],
    },
    {
        "type": "roles",
        "focus": None,
        "title": "Внесок backend розробників",
        "left_title": "Гребенчук Марія",
        "right_title": "Прохорова Валерія",
        "left": [
            "Участь у backend-модулях і REST API для основних сценаріїв платформи.",
            "Робота з доменною логікою, DTO/контрактами та структурою даних.",
            "Підтримка стабільності backend-частини для демонстрації на захисті.",
        ],
        "right": [
            "Участь у backend-логіці, інтеграції модулів і роботі з PostgreSQL.",
            "Підтримка авторизації, endpoints і взаємодії frontend з API.",
            "Перевірка працездатності backend-сценаріїв через Swagger і Docker-запуск.",
        ],
    },
    {
        "type": "final",
        "focus": None,
        "title": "20. Підсумок",
        "facts": [
            "Реалізовано працездатний LinkedIn-like MVP з frontend, backend, БД та Docker-запуском.",
            "Система має модульну архітектуру, JWT-безпеку, REST API і реальні користувацькі сценарії.",
            "Проєкт готовий до демонстрації на захисті та має зрозумілий roadmap після v1.",
        ],
    },
]


def normalize_slide_numbers():
    number = 1
    for slide in SLIDES:
        if slide.get("type") == "cover":
            continue
        title = re.sub(r"^\d+\.\s*", "", slide["title"])
        slide["title"] = f"{number}. {title}"
        number += 1


SLIDES = [
    {
        "type": "cover",
        "focus": None,
        "title": "LinkedIn Clone: LinkedIn-like платформа",
        "subtitle": "Frontend-частина дипломного проєкту професійного нетворкінгу",
        "facts": [
            "Проєкт: сайт для професійної взаємодії, пошуку роботи та комунікації",
            "Frontend розробники: Ямчук Тимур, Андрій Ротарь",
            "Стек frontend: React 19, Vite 6, React Router, Context API",
            "Інтеграція: REST API, JWT, Swagger, PostgreSQL через backend",
        ],
    },
    {
        "type": "statement",
        "focus": None,
        "title": "Вступ: чому саме LinkedIn",
        "headline": "LinkedIn обрано як найсильнішу модель, бо він поєднує професійний профіль, мережу контактів, контент, вакансії та комунікацію.",
        "points": [
            "Це не просто сайт з вакансіями, а повна професійна екосистема для кандидата, роботодавця і спільнот.",
            "Такий формат дозволяє показати більше дипломної роботи: UI, маршрути, стани, API-інтеграцію і різні сценарії користувача.",
            "Клон LinkedIn добре демонструється на захисті: користувач проходить шлях від реєстрації до пошуку роботи та спілкування.",
        ],
        "metric": "6",
        "metric_label": "основних розділів об'єднані в одному сайті",
    },
    {
        "type": "comparison",
        "focus": None,
        "title": "LinkedIn-підхід проти типових конкурентів",
        "left_title": "Що є у конкурентів",
        "right_title": "Що краще у LinkedIn Clone",
        "left": [
            "Job-board дає вакансії, але майже не розвиває професійний профіль користувача.",
            "Окремі соцмережі мають контент, але не прив'язані до кар'єрного сценарію.",
            "Месенджери вирішують комунікацію, але знаходяться поза професійною платформою.",
            "Багато аналогів показують окремі функції без єдиного користувацького шляху.",
        ],
        "right": [
            "Вакансії, профіль, стрічка, мережа, спільноти та чати працюють як одна система.",
            "Профіль користувача стає центром: навички, досвід, резюме, avatar і активність.",
            "Комунікація вбудована в сайт, тому користувач не виходить у сторонні сервіси.",
            "Frontend пов'язаний з API: auth, profile, jobs, content, network і messaging.",
        ],
    },
    {
        "type": "comparison",
        "focus": None,
        "title": "Порівняння з конкретними конкурентами",
        "left_title": "Що є у Work.ua, LinkedIn, Djinni, Robota.ua",
        "right_title": "Чого бракує там, але є у LinkedIn Clone",
        "left": [
            "Work.ua: сильний пошук вакансій, фільтри, резюме та відгуки, але фокус переважно на job-board сценарії.",
            "LinkedIn: сильна глобальна мережа, профіль, контент і вакансії, але продукт перевантажений для локального навчального MVP.",
            "Djinni: зручний IT-рекрутинг і анонімний профіль, але вузький фокус на наймі без широких спільнот і стрічки.",
            "Robota.ua: багато вакансій, резюме і роботодавців, але менше соціальної взаємодії, чатів і професійного контенту.",
        ],
        "right": [
            "У LinkedIn Clone вакансії не ізольовані: вони пов'язані з профілем, чатами, контактами і загальним шляхом кандидата.",
            "LinkedIn Clone бере логіку LinkedIn, але показує її у компактному MVP, де кожен модуль зрозумілий на захисті.",
            "У LinkedIn Clone є не тільки найм, а й контент, groups/pages/events, глобальний пошук і особистий кабінет.",
            "Наш сайт об'єднує job-board, професійну соцмережу і внутрішню комунікацію в одному frontend-сценарії.",
        ],
    },
    {
        "type": "modules",
        "focus": None,
        "title": "Переваги нашого сайту",
        "subtitle": "Переваги сформовані з того, що реально реалізовано в інтерфейсі та коді",
        "items": [
            ("Єдиний UX", "одна навігація для всіх сценаріїв"),
            ("Профіль", "навички, досвід, резюме, avatar"),
            ("Вакансії", "пошук, фільтри, saved, apply"),
            ("Контент", "стрічка, пости, реакції, коментарі"),
            ("Мережа", "контакти, groups, pages, events"),
            ("Чати", "діалоги, unread, AI assistant"),
            ("Теми та мови", "dark/light theme, i18n"),
            ("API-зв'язок", "реальні endpoint-и і token flow"),
        ],
    },
    {
        "type": "comparison",
        "focus": None,
        "title": "Що є у конкурентів і що додано у нас",
        "left_title": "У конкурентів",
        "right_title": "У нашому LinkedIn Clone",
        "left": [
            "Вакансії існують окремо від соціальної активності кандидата.",
            "Пошук роботи часто не пов'язаний з чатами та мережею контактів.",
            "Демонстраційні проєкти нерідко залишаються статичними макетами.",
            "Інтерфейс не завжди показує повний шлях користувача від входу до дії.",
        ],
        "right": [
            "Користувач шукає роботу, веде профіль, читає контент і спілкується в одному місці.",
            "Вакансії, контакти та повідомлення об'єднані в логічний кандидатський сценарій.",
            "Сайт має API-шар, JWT-сесію, fallback-дані і готовий demo-flow.",
            "На захисті можна показати послідовність: auth → profile → feed → jobs → chat.",
        ],
    },
    {
        "type": "modules",
        "focus": None,
        "title": "Що це за сайт",
        "subtitle": "LinkedIn Clone — це LinkedIn-like вебплатформа для професійного нетворкінгу",
        "items": [
            ("Auth", "реєстрація, login, session bootstrap"),
            ("Home", "головний екран і стрічка контенту"),
            ("Network", "контакти, спільноти, pages/events"),
            ("Vacancies", "вакансії, фільтри, відгуки"),
            ("Chat", "повідомлення та AI-помічник"),
            ("Profile", "особистий кабінет користувача"),
            ("Search", "глобальний пошук по сутностях"),
            ("UI", "адаптивні картки, теми, анімації"),
        ],
    },
    {
        "type": "architecture",
        "focus": None,
        "title": "Архітектура сайту",
        "steps": [
            ("React/Vite SPA", "сторінки, routing, state"),
            ("Providers", "auth, profile, network, jobs, chat"),
            ("API client", "tokens, refresh, errors"),
            ("Facade.API", "REST endpoints для frontend"),
            ("PostgreSQL", "дані модулів системи"),
        ],
        "note": "Frontend побудований як SPA: сторінки розділені за сценаріями, стан винесено в providers, а доступ до backend проходить через єдиний API-шар.",
    },
    {
        "type": "frontend",
        "focus": "home",
        "title": "З чого складається frontend",
        "routes": [
            ("/auth", "реєстрація, login, social demo"),
            ("/home", "стрічка, composer, mini inbox"),
            ("/network", "контакти, groups, pages/events"),
            ("/vacancies", "вакансії, фільтри, apply"),
            ("/chat", "повідомлення, AI assistant, calls"),
            ("/profile", "кабінет, avatar, skills, resume"),
        ],
    },
    {
        "type": "journey",
        "focus": "home",
        "title": "Наскрізний сценарій демонстрації",
        "steps": [
            "Реєстрація",
            "Профіль",
            "Стрічка",
            "Спільноти",
            "Вакансії",
            "Чати",
        ],
        "note": "Такий порядок дозволяє показати сайт як завершений продукт, а не набір окремих сторінок.",
    },
    {
        "type": "roles",
        "focus": None,
        "title": "Розподіл frontend-роботи",
        "left_title": "Ямчук Тимур",
        "right_title": "Андрій Ротарь",
        "left": [
            "Вікно реєстрації та auth UX.",
            "Сторінка вакансій і пошук роботи.",
            "Чати, дизайн і особистий кабінет.",
        ],
        "right": [
            "Головний екран і контент на сайті.",
            "Вкладка спільноти.",
            "Злиття backend з frontend.",
        ],
    },
    {
        "type": "feature",
        "focus": "profile",
        "title": "Ямчук Тимур: вікно реєстрації",
        "headline": "Реєстрація є першою точкою входу користувача в платформу.",
        "points": [
            "Побудовано зрозумілий auth UX: користувач бачить форму, стани введення та результат дії.",
            "Опрацьовано валідацію полів і повідомлення про помилки, щоб сценарій не виглядав як статичний макет.",
            "Після успішної реєстрації користувач переходить до подальшого користування сайтом.",
            "Auth-екран стилістично узгоджено з іншими частинами платформи.",
        ],
    },
    {
        "type": "feature",
        "focus": "vacancies",
        "title": "Ямчук Тимур: сторінка вакансій",
        "headline": "Сторінка вакансій реалізує один з головних сценаріїв LinkedIn-like платформи.",
        "points": [
            "Створено список вакансій з картками, основними параметрами і зрозумілою структурою перегляду.",
            "Додано відображення формату роботи, рівня досвіду, локації та інших характеристик вакансії.",
            "Підготовлено сценарії збереження вакансії та відгуку користувача.",
            "Сторінка вписана в загальну навігацію і не виглядає окремим модулем.",
        ],
    },
    {
        "type": "feature",
        "focus": "vacancies",
        "title": "Ямчук Тимур: пошук роботи",
        "headline": "Пошук роботи робить модуль вакансій корисним для щоденного сценарію кандидата.",
        "points": [
            "Реалізовано фільтрацію вакансій за ключовими параметрами.",
            "Опрацьовано сценарій, коли результатів немає або користувач змінює запит.",
            "Пошук допомагає швидко перейти від загального списку до релевантних вакансій.",
            "Цей блок підсилює головну перевагу сайту: вакансії пов'язані з профілем і комунікацією.",
        ],
    },
    {
        "type": "feature",
        "focus": "chat",
        "title": "Ямчук Тимур: чати",
        "headline": "Чати додають платформі внутрішню комунікацію без переходу в сторонні месенджери.",
        "points": [
            "Створено інтерфейс діалогів, повідомлень і станів unread.",
            "Додано сценарії архівації, mute, видалення повідомлень і share posts.",
            "Реалізовано AI assistant як додаткову демонстраційну функцію для швидких підказок.",
            "Комунікація підтримує ідею LinkedIn-like продукту: робота, контакти і повідомлення в одному місці.",
        ],
    },
    {
        "type": "feature",
        "focus": "profile",
        "title": "Ямчук Тимур: дизайн і особистий кабінет",
        "headline": "Особистий кабінет і дизайн формують завершене враження від frontend-частини.",
        "points": [
            "Профіль користувача містить особисті та професійні дані, avatar, skills і resume.",
            "Візуальний стиль узгоджено між auth, vacancies, chat і profile.",
            "Кабінет працює як центр професійної ідентичності користувача.",
            "Дизайн побудований на картках, темній/світлій темі, акцентах і зрозумілій навігації.",
        ],
    },
    {
        "type": "feature",
        "focus": "home",
        "title": "Андрій Ротарь: головний екран",
        "headline": "Головний екран задає перше враження і веде користувача до основних розділів платформи.",
        "points": [
            "Створено структуру home-сторінки з фокусом на професійний контент.",
            "Додано швидкий доступ до мережі, вакансій, повідомлень і профілю.",
            "Головний екран працює як стартова точка після авторизації.",
            "Навігація допомагає показати сайт як цілісну платформу.",
        ],
    },
    {
        "type": "feature",
        "focus": "home",
        "title": "Андрій Ротарь: контент на сайті",
        "headline": "Контентна стрічка робить платформу живою, а не лише каталогом вакансій.",
        "points": [
            "Реалізовано подачу постів у форматі професійної стрічки.",
            "Додано взаємодії з контентом: реакції, коментарі та оновлення після дій користувача.",
            "Контент підтримує ідею професійної активності та розвитку персонального бренду.",
            "Стрічка логічно пов'язана з профілем, мережею контактів і головною навігацією.",
        ],
    },
    {
        "type": "feature",
        "focus": "network",
        "title": "Андрій Ротарь: вкладка спільноти",
        "headline": "Спільноти розширюють сайт від пошуку роботи до професійного нетворкінгу.",
        "points": [
            "Вкладка network об'єднує контакти, підписки, групи, сторінки та події.",
            "Користувач може бачити професійне оточення, а не лише список вакансій.",
            "Groups/pages/events підсилюють відмінність LinkedIn Clone від звичайного job-board.",
            "Сторінка спільноти підтримує довгострокову взаємодію користувачів.",
        ],
    },
    {
        "type": "feature",
        "focus": "home",
        "title": "Андрій Ротарь: злиття backend з frontend",
        "headline": "Інтеграція з backend перетворює frontend із макета на робочий вебзастосунок.",
        "points": [
            "Налаштовано API-взаємодію для auth, profile, content, network, jobs і messaging.",
            "Frontend працює з token flow: access token, refresh token і session bootstrap.",
            "Proxy та API-клієнт дозволяють запускати сайт локально і демонструвати реальні сценарії.",
            "Fallback-дані залишають демо стабільним, навіть якщо backend недоступний.",
        ],
    },
    {
        "type": "matrix",
        "focus": None,
        "title": "Висновок по frontend-роботі",
        "left_title": "Що реалізовано",
        "right_title": "Практичний результат",
        "left": [
            "Створено основні сторінки LinkedIn-like платформи: auth, home, network, vacancies, chat, profile.",
            "Реалізовано користувацькі сценарії: реєстрація, профіль, контент, пошук роботи, чати.",
            "Інтерфейс об'єднано з API-шаром і підтримкою станів користувача.",
        ],
        "right": [
            "Сайт можна демонструвати як завершений frontend-продукт, а не набір макетів.",
            "Кожен учасник frontend-команди має чітку зону виступу на захисті.",
            "Проєкт показує перевагу LinkedIn-like підходу над простими сайтами вакансій.",
        ],
    },
    {
        "type": "final",
        "focus": None,
        "title": "Підсумок",
        "facts": [
            "LinkedIn Clone демонструє професійну платформу з профілем, контентом, мережею, вакансіями та чатами.",
            "Frontend-частина має зрозумілий користувацький шлях і розподіл відповідальності між Тимуром та Андрієм.",
            "Головна перевага проєкту — не окрема функція, а цілісна LinkedIn-like екосистема.",
        ],
    },
]


def apply_report_style():
    report_labels = ["Причина вибору", "Обране рішення", "Реалізація", "Результат"]

    for slide in SLIDES:
        if slide.get("type") == "cover":
            slide["facts"] = [
                "Формат звіту: кожен слайд пояснює причину вибору рішення та результат",
                *slide["facts"],
            ]
            continue

        if not slide["title"].startswith("Звіт:"):
            slide["title"] = f"Звіт: {slide['title']}"

        if slide["type"] == "statement":
            slide["headline"] = f"Обґрунтування рішення: {slide['headline']}"
            slide["points"] = [
                f"{report_labels[i]}: {point}"
                for i, point in enumerate(slide["points"])
            ]

        elif slide["type"] == "comparison":
            slide["left_title"] = f"Стан у конкурентів: {slide['left_title']}"
            slide["right_title"] = f"Наше рішення: {slide['right_title']}"
            slide["left"] = [
                f"Аналіз: {point}" for point in slide["left"]
            ]
            slide["right"] = [
                f"Перевага: {point}" for point in slide["right"]
            ]

        elif slide["type"] == "modules":
            slide["subtitle"] = f"Звітний висновок: {slide['subtitle']}"
            slide["items"] = [
                (name, f"Рішення: {desc}") for name, desc in slide["items"]
            ]

        elif slide["type"] == "architecture":
            slide["steps"] = [
                (name, f"Чому обрано: {desc}") for name, desc in slide["steps"]
            ]
            slide["note"] = f"Результат рішення: {slide['note']}"

        elif slide["type"] == "frontend":
            slide["routes"] = [
                (route, f"Роль у рішенні: {desc}") for route, desc in slide["routes"]
            ]

        elif slide["type"] == "journey":
            slide["note"] = f"Звітний результат: {slide['note']}"

        elif slide["type"] == "roles":
            slide["left"] = [f"Зона відповідальності: {point}" for point in slide["left"]]
            slide["right"] = [f"Зона відповідальності: {point}" for point in slide["right"]]

        elif slide["type"] == "feature":
            slide["headline"] = f"Обґрунтування рішення: {slide['headline']}"
            slide["points"] = [
                f"{report_labels[i]}: {point}"
                for i, point in enumerate(slide["points"])
            ]

        elif slide["type"] == "matrix":
            slide["left_title"] = f"Причина / виконання: {slide['left_title']}"
            slide["right_title"] = f"Результат / висновок: {slide['right_title']}"
            slide["left"] = [f"Звіт: {point}" for point in slide["left"]]
            slide["right"] = [f"Висновок: {point}" for point in slide["right"]]

        elif slide["type"] == "final":
            slide["facts"] = [f"Підсумковий висновок: {fact}" for fact in slide["facts"]]


apply_report_style()
normalize_slide_numbers()


def add_shape(slide, shape_type, x, y, w, h, color, line_color=None):
    shape = slide.shapes.add_shape(shape_type, Inches(x), Inches(y), Inches(w), Inches(h))
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    if line_color is None:
        shape.line.fill.background()
    else:
        shape.line.fill.solid()
        shape.line.color.rgb = line_color
    return shape


def add_text(slide, x, y, w, h, text, size=18, bold=False, color=TEXT, align=PP_ALIGN.LEFT):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    box.text_frame.word_wrap = True
    box.text_frame.margin_left = Inches(0.04)
    box.text_frame.margin_right = Inches(0.04)
    box.text_frame.margin_top = Inches(0.03)
    box.text_frame.margin_bottom = Inches(0.03)
    p = box.text_frame.paragraphs[0]
    p.text = text
    p.font.size = Pt(size)
    p.font.bold = bold
    p.font.color.rgb = color
    p.alignment = align
    return box


def add_centered_text(slide, x, y, w, h, text, size=18, bold=False, color=TEXT):
    box = add_text(slide, x, y, w, h, text, size=size, bold=bold, color=color, align=PP_ALIGN.CENTER)
    box.text_frame.vertical_anchor = MSO_ANCHOR.MIDDLE
    return box


def add_bullet_list(slide, items, x, y, w, line_h=0.56, size=13, color=TEXT):
    for i, txt in enumerate(items):
        add_shape(slide, MSO_AUTO_SHAPE_TYPE.OVAL, x, y + i * line_h + 0.12, 0.12, 0.12, PURPLE_SOFT)
        add_text(slide, x + 0.25, y + i * line_h, w - 0.25, line_h, txt, size=size, color=color)


def add_title(slide, title, subtitle=None):
    add_text(slide, 0.7, 0.86, 12.0, 0.55, title, size=24, bold=True, color=TEXT)
    if subtitle:
        add_text(slide, 0.72, 1.38, 11.4, 0.32, subtitle, size=12, color=TEXT_MUTED)


def add_card_with_shadow(slide, x, y, w, h, radius_color=CARD):
    shadow = add_shape(slide, MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, x + 0.04, y + 0.05, w, h, RGBColor(7, 9, 13))
    card = add_shape(slide, MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, x, y, w, h, radius_color, line_color=BORDER)
    return shadow, card


def draw_nav_buttons(slide, focus):
    start_x = 2.55
    y = 0.14
    w = 1.62
    gap = 0.12
    for i, (key, label) in enumerate(NAV_ITEMS):
        x = start_x + i * (w + gap)
        active = key == focus
        shape = add_shape(
            slide,
            MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE,
            x,
            y,
            w,
            0.28,
            PURPLE_SOFT if active else CARD_SOFT,
            line_color=BORDER,
        )
        p = shape.text_frame.paragraphs[0]
        p.text = label
        p.font.size = Pt(10)
        p.font.bold = active
        p.font.color.rgb = RGBColor(20, 24, 36) if active else TEXT_MUTED
        p.alignment = PP_ALIGN.CENTER


def draw_base(slide, idx, total, focus, show_nav=True, show_header=True):
    add_shape(slide, MSO_AUTO_SHAPE_TYPE.RECTANGLE, 0, 0, 13.333, 7.5, BG_DARK)
    add_shape(slide, MSO_AUTO_SHAPE_TYPE.OVAL, 9.8, -1.45, 4.0, 4.0, RGBColor(18, 32, 55))
    add_shape(slide, MSO_AUTO_SHAPE_TYPE.OVAL, -1.3, 5.25, 3.6, 3.6, RGBColor(22, 24, 47))
    if show_header:
        add_shape(slide, MSO_AUTO_SHAPE_TYPE.RECTANGLE, 0, 0, 13.333, 0.72, BG_DARK_2)
        add_shape(slide, MSO_AUTO_SHAPE_TYPE.RECTANGLE, 0, 0.7, 13.333, 0.02, BORDER)
        logo = add_shape(slide, MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, 0.62, 0.13, 0.46, 0.42, BLUE, line_color=BLUE)
        logo.text_frame.text = "in"
        p = logo.text_frame.paragraphs[0]
        p.font.size = Pt(18)
        p.font.bold = True
        p.font.color.rgb = WHITE
        p.alignment = PP_ALIGN.CENTER
        add_text(slide, 1.18, 0.19, 1.55, 0.25, "LinkedIn Clone", size=11, bold=True, color=TEXT)
        if show_nav:
            draw_nav_buttons(slide, focus)
    add_shape(slide, MSO_AUTO_SHAPE_TYPE.RECTANGLE, 0, 7.32, 13.333, 0.18, BG_DARK_2)
    add_shape(slide, MSO_AUTO_SHAPE_TYPE.RECTANGLE, 0, 7.32, 13.333 * idx / total, 0.18, BLUE)
    add_text(slide, 0.55, 7.31, 2.3, 0.12, "LinkedIn Diplom", size=8, color=TEXT_MUTED)
    add_text(slide, 12.3, 7.31, 0.9, 0.12, f"{idx}/{total}", size=8, color=TEXT_MUTED, align=PP_ALIGN.RIGHT)


def draw_cover(slide, data, idx, total):
    draw_base(slide, idx, total, data.get("focus"), show_nav=False, show_header=False)
    add_shape(slide, MSO_AUTO_SHAPE_TYPE.OVAL, 10.4, 0.75, 2.2, 2.2, BLUE_SOFT)
    add_shape(slide, MSO_AUTO_SHAPE_TYPE.OVAL, 9.8, 2.6, 3.0, 3.0, RGBColor(17, 37, 63))
    add_shape(slide, MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, 0.68, 0.95, 1.18, 0.9, BLUE, line_color=BLUE).text_frame.text = "in"
    p = slide.shapes[-1].text_frame.paragraphs[0]
    p.font.size = Pt(34)
    p.font.bold = True
    p.font.color.rgb = WHITE
    p.alignment = PP_ALIGN.CENTER
    add_text(slide, 2.15, 1.02, 9.45, 0.9, data["title"], size=39, bold=True, color=WHITE)
    add_text(slide, 2.18, 1.9, 9.1, 0.68, data["subtitle"], size=19, color=RGBColor(203, 213, 225))
    add_card_with_shadow(slide, 2.18, 2.95, 9.9, 3.35, CARD)
    for i, fact in enumerate(data["facts"]):
        add_text(slide, 2.55, 3.22 + i * 0.56, 9.05, 0.48, fact, size=14, color=TEXT)


def draw_cards(slide, data, idx, total):
    draw_base(slide, idx, total, data.get("focus"))
    add_title(slide, data["title"], "Ключові аргументи та результати")
    cards = [(0.8, 1.98), (6.95, 1.98), (0.8, 4.33), (6.95, 4.33)]
    for i, txt in enumerate(data["points"]):
        x, y = cards[i]
        add_card_with_shadow(slide, x, y, 5.55, 2.1, CARD)
        badge = add_shape(slide, MSO_AUTO_SHAPE_TYPE.OVAL, x + 0.2, y + 0.2, 0.45, 0.45, BLUE)
        badge.text_frame.text = str(i + 1)
        bp = badge.text_frame.paragraphs[0]
        bp.alignment = PP_ALIGN.CENTER
        bp.font.bold = True
        bp.font.size = Pt(12)
        bp.font.color.rgb = WHITE
        add_text(slide, x + 0.78, y + 0.22, 4.55, 1.72, txt, size=12.5, color=TEXT)


def draw_matrix(slide, data, idx, total):
    draw_base(slide, idx, total, data.get("focus"))
    add_title(slide, data["title"])
    add_card_with_shadow(slide, 0.8, 1.95, 5.95, 5.05, CARD)
    add_card_with_shadow(slide, 6.55, 1.95, 5.95, 5.05, CARD)
    add_shape(slide, MSO_AUTO_SHAPE_TYPE.RECTANGLE, 0.8, 1.95, 5.95, 0.05, PURPLE_SOFT)
    add_shape(slide, MSO_AUTO_SHAPE_TYPE.RECTANGLE, 6.55, 1.95, 5.95, 0.05, PURPLE_SOFT)
    add_shape(slide, MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, 1.05, 2.18, 2.45, 0.38, BLUE_SOFT)
    add_shape(slide, MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, 6.8, 2.18, 2.95, 0.38, BLUE_SOFT)
    add_text(slide, 1.2, 2.25, 2.1, 0.2, data.get("left_title", "Факти"), size=11, bold=True, color=WHITE)
    add_text(slide, 6.95, 2.25, 2.9, 0.2, data.get("right_title", "Практичні висновки"), size=11, bold=True, color=WHITE)
    left_items = data["left"]
    right_items = data["right"]
    left_gap = 4.15 / max(1, len(left_items))
    right_gap = 4.15 / max(1, len(right_items))
    for i, txt in enumerate(left_items):
        y = 2.6 + i * left_gap
        add_shape(slide, MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, 1.02, y, 5.5, left_gap - 0.1, CARD_SOFT, line_color=BORDER)
        add_shape(slide, MSO_AUTO_SHAPE_TYPE.RECTANGLE, 1.08, y + 0.14, 0.07, left_gap - 0.38, PURPLE_SOFT)
        add_text(slide, 1.28, y + 0.08, 5.05, left_gap - 0.16, txt, size=11.5, color=TEXT)
    for i, txt in enumerate(right_items):
        y = 2.6 + i * right_gap
        add_shape(slide, MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, 6.77, y, 5.5, right_gap - 0.1, CARD_SOFT, line_color=BORDER)
        add_shape(slide, MSO_AUTO_SHAPE_TYPE.RECTANGLE, 6.83, y + 0.14, 0.07, right_gap - 0.38, PURPLE_SOFT)
        add_text(slide, 7.03, y + 0.08, 5.05, right_gap - 0.16, txt, size=11.5, color=TEXT)


def draw_process(slide, data, idx, total):
    draw_base(slide, idx, total, data.get("focus"))
    add_title(slide, data["title"], "Поетапна логіка реалізації")
    steps = data["steps"]
    count = max(1, len(steps))
    grid_start = 0.85
    grid_width = 11.65
    gap = 0.28
    step_w = (grid_width - gap * (count - 1)) / count
    for i, step in enumerate(steps):
        x = grid_start + i * (step_w + gap)
        color = CARD if i % 2 == 0 else CARD_SOFT
        add_card_with_shadow(slide, x, 2.2, step_w, 2.65, color)
        add_shape(slide, MSO_AUTO_SHAPE_TYPE.OVAL, x + (step_w / 2) - 0.27, 2.45, 0.55, 0.55, BLUE).text_frame.text = str(i + 1)
        p = slide.shapes[-1].text_frame.paragraphs[0]
        p.font.bold = True
        p.font.size = Pt(13)
        p.font.color.rgb = WHITE
        p.alignment = PP_ALIGN.CENTER
        add_text(slide, x + 0.12, 3.16, step_w - 0.24, 1.4, step, size=12, align=PP_ALIGN.CENTER, color=TEXT)
        if i < count - 1:
            add_shape(slide, MSO_AUTO_SHAPE_TYPE.CHEVRON, x + step_w + 0.03, 3.25, 0.18, 0.5, BLUE_SOFT)
    add_shape(slide, MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, 0.9, 5.45, 11.95, 1.2, CARD)
    add_text(slide, 1.2, 5.77, 11.3, 0.65, "Кожний етап має пряме технічне підтвердження у коді, маршрутах API та робочих екранах frontend.", size=13, color=TEXT_MUTED)


def draw_two_col(slide, data, idx, total):
    draw_base(slide, idx, total, data.get("focus"))
    add_title(slide, data["title"])
    add_card_with_shadow(slide, 0.8, 1.85, 5.85, 5.25, CARD)
    add_card_with_shadow(slide, 6.65, 1.85, 5.85, 5.25, CARD)
    add_text(slide, 1.1, 2.18, 5.1, 0.45, data["col1_title"], size=16, bold=True, color=TEXT)
    add_text(slide, 6.95, 2.18, 5.1, 0.45, data["col2_title"], size=16, bold=True, color=TEXT)
    for i, val in enumerate(data["col1"]):
        add_text(slide, 1.1, 2.7 + i * 0.78, 5.1, 0.65, f"• {val}", size=13, color=TEXT)
    for i, val in enumerate(data["col2"]):
        add_text(slide, 6.95, 2.7 + i * 0.78, 5.1, 0.65, f"• {val}", size=13, color=TEXT)


def draw_report(slide, data, idx, total):
    draw_base(slide, idx, total, data.get("focus"))
    add_title(slide, data["title"], "Звітні твердження з підтвердженням")
    for i, row in enumerate(data["rows"]):
        y = 1.95 + i * 1.33
        add_shape(slide, MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, 0.9, y, 3.4, 1.02, BLUE_SOFT)
        add_card_with_shadow(slide, 4.45, y, 7.95, 1.02, CARD)
        add_text(slide, 1.2, y + 0.24, 2.9, 0.55, row[0], size=13, bold=True, color=WHITE)
        add_text(slide, 4.75, y + 0.2, 7.4, 0.62, row[1], size=13, color=TEXT)


def draw_statement(slide, data, idx, total):
    draw_base(slide, idx, total, data.get("focus"))
    add_title(slide, data["title"])
    add_text(slide, 0.9, 1.78, 7.3, 1.15, data["headline"], size=27, bold=True, color=WHITE)
    add_card_with_shadow(slide, 8.65, 1.55, 3.15, 3.0, CARD_SOFT)
    add_centered_text(slide, 9.0, 1.95, 2.45, 1.15, data["metric"], size=70, bold=True, color=PURPLE_SOFT)
    add_centered_text(slide, 9.0, 3.15, 2.45, 0.7, data["metric_label"], size=13, color=TEXT)
    add_card_with_shadow(slide, 0.95, 3.48, 7.4, 2.35, CARD)
    add_bullet_list(slide, data["points"], 1.25, 3.82, 6.75, line_h=0.62, size=14)
    add_shape(slide, MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, 8.95, 4.95, 2.55, 0.55, BLUE, line_color=BLUE)
    add_centered_text(slide, 9.04, 5.08, 2.35, 0.25, "MVP для захисту", size=12, bold=True, color=WHITE)


def draw_modules(slide, data, idx, total):
    draw_base(slide, idx, total, data.get("focus"))
    add_title(slide, data["title"], data.get("subtitle"))
    cols = 4
    card_w = 2.86
    card_h = 1.28
    start_x = 0.82
    start_y = 1.95
    gap_x = 0.32
    gap_y = 0.32
    colors = [BLUE, PURPLE, CYAN, GREEN, ORANGE, BLUE, PURPLE, CYAN]
    for i, (name, desc) in enumerate(data["items"]):
        row = i // cols
        col = i % cols
        x = start_x + col * (card_w + gap_x)
        y = start_y + row * (card_h + gap_y)
        add_card_with_shadow(slide, x, y, card_w, card_h, CARD)
        add_shape(slide, MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, x + 0.18, y + 0.2, 0.58, 0.38, colors[i % len(colors)], line_color=colors[i % len(colors)])
        add_text(slide, x + 0.88, y + 0.18, 1.75, 0.34, name, size=14, bold=True, color=TEXT)
        add_text(slide, x + 0.22, y + 0.68, card_w - 0.44, 0.42, desc, size=10.5, color=TEXT_MUTED)
    add_card_with_shadow(slide, 1.15, 5.5, 11.0, 0.82, CARD_SOFT)
    add_centered_text(slide, 1.35, 5.66, 10.6, 0.42, "Єдина платформа: користувач не перемикається між окремими сервісами для роботи, контенту та комунікації.", size=13, color=TEXT)


def draw_comparison(slide, data, idx, total):
    draw_base(slide, idx, total, data.get("focus"))
    add_title(slide, data["title"])
    add_card_with_shadow(slide, 0.78, 1.78, 5.82, 4.95, CARD)
    add_card_with_shadow(slide, 6.72, 1.78, 5.82, 4.95, CARD_SOFT)
    add_shape(slide, MSO_AUTO_SHAPE_TYPE.RECTANGLE, 0.78, 1.78, 5.82, 0.07, ORANGE)
    add_shape(slide, MSO_AUTO_SHAPE_TYPE.RECTANGLE, 6.72, 1.78, 5.82, 0.07, GREEN)
    add_text(slide, 1.08, 2.14, 4.9, 0.4, data["left_title"], size=18, bold=True, color=ORANGE)
    add_text(slide, 7.02, 2.14, 4.9, 0.4, data["right_title"], size=18, bold=True, color=GREEN)
    add_bullet_list(slide, data["left"], 1.08, 2.78, 5.1, line_h=0.74, size=13)
    add_bullet_list(slide, data["right"], 7.02, 2.78, 5.1, line_h=0.74, size=13)


def draw_stack(slide, data, idx, total):
    draw_base(slide, idx, total, data.get("focus"))
    add_title(slide, data["title"], "Стек відповідає реальному коду проєкту та документації")
    for i, (group, items) in enumerate(data["groups"]):
        x = 0.82 + (i % 2) * 6.0
        y = 1.9 + (i // 2) * 2.38
        add_card_with_shadow(slide, x, y, 5.65, 2.05, CARD)
        add_text(slide, x + 0.28, y + 0.22, 5.0, 0.32, group, size=17, bold=True, color=PURPLE_SOFT)
        for j, item in enumerate(items):
            chip_x = x + 0.28 + (j % 3) * 1.72
            chip_y = y + 0.75 + (j // 3) * 0.52
            add_shape(slide, MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, chip_x, chip_y, 1.55, 0.33, CARD_LIGHT, line_color=BORDER)
            add_centered_text(slide, chip_x + 0.04, chip_y + 0.06, 1.47, 0.16, item, size=8.5, color=TEXT)


def draw_architecture(slide, data, idx, total):
    draw_base(slide, idx, total, data.get("focus"))
    add_title(slide, data["title"], "Основний потік запиту від інтерфейсу до бази даних")
    count = len(data["steps"])
    start_x = 0.72
    y = 2.08
    w = 2.25
    gap = 0.28
    colors = [BLUE, PURPLE, CYAN, GREEN, ORANGE]
    for i, (name, desc) in enumerate(data["steps"]):
        x = start_x + i * (w + gap)
        add_card_with_shadow(slide, x, y, w, 2.05, CARD)
        add_centered_text(slide, x + 0.22, y + 0.3, w - 0.44, 0.5, name, size=14, bold=True, color=colors[i])
        add_centered_text(slide, x + 0.2, y + 0.95, w - 0.4, 0.55, desc, size=11, color=TEXT)
        if i < count - 1:
            add_shape(slide, MSO_AUTO_SHAPE_TYPE.CHEVRON, x + w + 0.05, y + 0.75, 0.18, 0.55, BLUE_SOFT)
    add_card_with_shadow(slide, 1.1, 5.08, 11.1, 1.05, CARD_SOFT)
    add_text(slide, 1.45, 5.36, 10.5, 0.45, data["note"], size=13, color=TEXT)


def draw_database(slide, data, idx, total):
    draw_base(slide, idx, total, data.get("focus"))
    add_title(slide, data["title"], "Логічна ізоляція даних за доменами")
    add_card_with_shadow(slide, 0.92, 1.86, 4.1, 4.45, CARD)
    add_centered_text(slide, 1.35, 2.18, 3.25, 0.42, "PostgreSQL 16", size=20, bold=True, color=CYAN)
    cols = 3
    for i, schema in enumerate(data["schemas"]):
        x = 1.2 + (i % cols) * 1.18
        y = 2.9 + (i // cols) * 0.72
        add_shape(slide, MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, x, y, 1.0, 0.42, CARD_LIGHT, line_color=BORDER)
        add_centered_text(slide, x + 0.03, y + 0.1, 0.94, 0.16, schema, size=7.7, color=TEXT)
    add_card_with_shadow(slide, 5.55, 1.86, 6.85, 4.45, CARD_SOFT)
    add_bullet_list(slide, data["points"], 5.9, 2.28, 6.0, line_h=0.78, size=13)


def draw_security(slide, data, idx, total):
    draw_base(slide, idx, total, data.get("focus"))
    add_title(slide, data["title"])
    for i, (name, desc) in enumerate(data["points"]):
        x = 0.9 + (i % 2) * 5.9
        y = 1.88 + (i // 2) * 2.08
        add_card_with_shadow(slide, x, y, 5.45, 1.72, CARD)
        add_shape(slide, MSO_AUTO_SHAPE_TYPE.OVAL, x + 0.25, y + 0.42, 0.62, 0.62, BLUE if i % 2 == 0 else PURPLE)
        add_centered_text(slide, x + 0.25, y + 0.53, 0.62, 0.26, "✓", size=17, bold=True, color=WHITE)
        add_text(slide, x + 1.1, y + 0.28, 4.0, 0.35, name, size=16, bold=True, color=TEXT)
        add_text(slide, x + 1.1, y + 0.72, 4.0, 0.55, desc, size=12, color=TEXT_MUTED)


def draw_frontend(slide, data, idx, total):
    draw_base(slide, idx, total, data.get("focus"))
    add_title(slide, data["title"], "SPA з guarded routes, state providers, темною/світлою темою та i18n")
    add_card_with_shadow(slide, 0.86, 1.78, 11.65, 4.95, CARD)
    for i, (route, desc) in enumerate(data["routes"]):
        x = 1.22 + (i % 3) * 3.62
        y = 2.16 + (i // 3) * 2.0
        add_shape(slide, MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, x, y, 3.1, 1.48, CARD_SOFT, line_color=BORDER)
        add_text(slide, x + 0.24, y + 0.25, 2.65, 0.28, route, size=18, bold=True, color=PURPLE_SOFT)
        add_text(slide, x + 0.24, y + 0.72, 2.65, 0.44, desc, size=11.5, color=TEXT)


def draw_journey(slide, data, idx, total):
    draw_base(slide, idx, total, data.get("focus"))
    add_title(slide, data["title"], "Демонстраційний шлях користувача на захисті")
    start_x = 0.72
    y = 2.34
    w = 1.74
    for i, step in enumerate(data["steps"]):
        x = start_x + i * 2.05
        add_shape(slide, MSO_AUTO_SHAPE_TYPE.OVAL, x, y, 1.15, 1.15, BLUE if i < 3 else PURPLE)
        add_centered_text(slide, x, y + 0.08, 1.15, 0.46, str(i + 1), size=20, bold=True, color=WHITE)
        add_centered_text(slide, x - 0.28, y + 1.35, w, 0.62, step, size=11.5, color=TEXT)
        if i < len(data["steps"]) - 1:
            add_shape(slide, MSO_AUTO_SHAPE_TYPE.CHEVRON, x + 1.28, y + 0.32, 0.38, 0.48, BLUE_SOFT)
    add_card_with_shadow(slide, 1.25, 5.25, 10.75, 0.9, CARD_SOFT)
    add_centered_text(slide, 1.55, 5.42, 10.15, 0.42, data["note"], size=13, color=TEXT)


def draw_feature(slide, data, idx, total):
    draw_base(slide, idx, total, data.get("focus"))
    add_title(slide, data["title"])
    add_text(slide, 0.92, 1.75, 6.9, 0.92, data["headline"], size=22, bold=True, color=WHITE)
    add_card_with_shadow(slide, 0.95, 3.02, 6.85, 2.75, CARD)
    add_bullet_list(slide, data["points"], 1.26, 3.34, 6.1, line_h=0.55, size=12.4)
    add_card_with_shadow(slide, 8.15, 1.78, 3.65, 4.8, CARD_SOFT)
    add_shape(slide, MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, 8.45, 2.12, 3.05, 0.38, BLUE_SOFT, line_color=BORDER)
    add_shape(slide, MSO_AUTO_SHAPE_TYPE.RECTANGLE, 8.45, 2.78, 3.05, 0.05, BORDER)
    add_shape(slide, MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, 8.45, 3.05, 2.45, 0.52, CARD_LIGHT, line_color=BORDER)
    add_shape(slide, MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, 8.45, 3.85, 2.8, 0.52, CARD_LIGHT, line_color=BORDER)
    add_shape(slide, MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, 8.45, 4.65, 2.15, 0.52, CARD_LIGHT, line_color=BORDER)
    add_shape(slide, MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, 8.45, 5.55, 1.5, 0.34, BLUE, line_color=BLUE)
    add_text(slide, 8.62, 2.2, 2.7, 0.12, "UI mockup", size=8.5, color=TEXT_MUTED)
    add_centered_text(slide, 8.52, 5.62, 1.35, 0.12, "Action", size=8.5, bold=True, color=WHITE)


def draw_integration(slide, data, idx, total):
    draw_base(slide, idx, total, data.get("focus"))
    add_title(slide, data["title"], "Єдиний клієнт API, токени в localStorage, refresh при 401")
    for i, (domain, routes) in enumerate(data["rows"]):
        y = 1.82 + i * 0.72
        add_shape(slide, MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, 0.9, y, 2.35, 0.48, BLUE_SOFT, line_color=BORDER)
        add_card_with_shadow(slide, 3.45, y - 0.02, 8.35, 0.52, CARD)
        add_centered_text(slide, 1.0, y + 0.1, 2.15, 0.16, domain, size=10.5, bold=True, color=WHITE)
        add_text(slide, 3.7, y + 0.08, 7.8, 0.2, routes, size=10.3, color=TEXT)


def draw_quality(slide, data, idx, total):
    draw_base(slide, idx, total, data.get("focus"))
    add_title(slide, data["title"])
    for i, (name, desc) in enumerate(data["items"]):
        x = 0.88 + (i % 3) * 4.0
        y = 1.92 + (i // 3) * 2.0
        add_card_with_shadow(slide, x, y, 3.55, 1.52, CARD)
        add_text(slide, x + 0.24, y + 0.22, 3.0, 0.3, name, size=15, bold=True, color=PURPLE_SOFT)
        add_text(slide, x + 0.24, y + 0.72, 3.05, 0.42, desc, size=11.5, color=TEXT)


def draw_infrastructure(slide, data, idx, total):
    draw_base(slide, idx, total, data.get("focus"))
    add_title(slide, data["title"], "Проєкт відтворюється локально та через Docker Compose")
    for i, (name, desc) in enumerate(data["points"]):
        y = 1.95 + i * 1.02
        add_shape(slide, MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, 1.05, y, 2.65, 0.68, CARD_LIGHT, line_color=BORDER)
        add_card_with_shadow(slide, 4.0, y - 0.02, 7.65, 0.72, CARD)
        add_centered_text(slide, 1.18, y + 0.18, 2.38, 0.18, name, size=12, bold=True, color=CYAN)
        add_text(slide, 4.3, y + 0.18, 7.05, 0.22, desc, size=12, color=TEXT)


def draw_roadmap(slide, data, idx, total):
    draw_base(slide, idx, total, data.get("focus"))
    add_title(slide, data["title"], "Що чесно винесено за межі першої версії")
    for i, (name, desc) in enumerate(data["steps"]):
        x = 0.9 + i * 2.45
        add_card_with_shadow(slide, x, 2.05, 2.0, 3.55, CARD)
        add_centered_text(slide, x + 0.32, 2.38, 1.35, 0.52, str(i + 1), size=28, bold=True, color=PURPLE_SOFT)
        add_centered_text(slide, x + 0.16, 3.18, 1.68, 0.34, name, size=13, bold=True, color=TEXT)
        add_centered_text(slide, x + 0.18, 3.82, 1.64, 0.82, desc, size=10.5, color=TEXT_MUTED)


def draw_roles(slide, data, idx, total):
    draw_matrix(slide, data, idx, total)


def draw_final(slide, data, idx, total):
    draw_base(slide, idx, total, data.get("focus"))
    add_text(slide, 1.0, 1.35, 11.0, 0.8, data["title"], size=38, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_text(slide, 1.35, 2.15, 10.65, 0.45, "Готовий MVP демонструє повний цикл: інтерфейс, API, дані, безпеку та запуск.", size=17, color=TEXT_MUTED, align=PP_ALIGN.CENTER)
    for i, fact in enumerate(data["facts"]):
        add_card_with_shadow(slide, 1.55, 3.05 + i * 0.9, 10.2, 0.68, CARD_SOFT)
        add_text(slide, 1.9, 3.22 + i * 0.9, 9.45, 0.24, fact, size=13.5, color=TEXT)


def build_presentation():
    presentation = Presentation()
    presentation.slide_width = Inches(13.333)
    presentation.slide_height = Inches(7.5)
    total = len(SLIDES)

    draw_map = {
        "cover": draw_cover,
        "cards": draw_cards,
        "matrix": draw_matrix,
        "process": draw_process,
        "two_col": draw_two_col,
        "report": draw_report,
        "statement": draw_statement,
        "modules": draw_modules,
        "comparison": draw_comparison,
        "stack": draw_stack,
        "architecture": draw_architecture,
        "database": draw_database,
        "security": draw_security,
        "frontend": draw_frontend,
        "journey": draw_journey,
        "feature": draw_feature,
        "integration": draw_integration,
        "quality": draw_quality,
        "infrastructure": draw_infrastructure,
        "roadmap": draw_roadmap,
        "roles": draw_roles,
        "final": draw_final,
    }

    for idx, data in enumerate(SLIDES, start=1):
        slide = presentation.slides.add_slide(presentation.slide_layouts[6])
        draw_map[data["type"]](slide, data, idx, total)

    presentation.save(OUTPUT_DOCS_FILE)
    presentation.save(OUTPUT_ROOT_FILE)


if __name__ == "__main__":
    build_presentation()
    print(f"Presentation saved: {OUTPUT_DOCS_FILE}")
    print(f"Presentation saved: {OUTPUT_ROOT_FILE}")
