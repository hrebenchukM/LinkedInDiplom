namespace Facade.API.Seeding;

internal sealed record DemoBotPersona(
    string UserName,
    string Email,
    string FirstName,
    string LastName,
    string Headline,
    string Location,
    string[] Posts);

internal static class DemoBotCatalog
{
    internal const string BotEmailDomain = "@demo.linkup";

    // Merger used 80; 40 fills several feed pages with faster first-time dev seed.
    internal const int TargetPostCount = 40;

    internal const int CommentsPerPost = 2;
    internal const string EnrichedMarker = "📷";

    private static readonly string[] CommentPool =
    [
        "Great insight — thanks for sharing!",
        "This resonates. We saw something similar on our team.",
        "Congrats! Would love to hear more details.",
        "Saving this for our next sprint planning.",
        "Strong take. How did you measure the impact?",
        "Well said. Sharing with my network.",
        "Really helpful perspective — appreciate the post.",
        "We tried something similar and learned a lot too.",
        "Clear and practical. Bookmarked.",
        "Love the energy here. Keep posting!",
        "Curious what tools you used for this?",
        "This is the kind of update I enjoy seeing in my feed.",
        "Agree 100%. Culture and execution go hand in hand.",
        "Following for part two if you write it.",
        "Nice work — the results speak for themselves.",
        "Дякую за пост — дуже корисно!",
        "Solid breakdown. Learned something new today.",
        "Our team discussed this exact topic yesterday.",
        "Inspiring update. Rooting for your next milestone.",
        "Good reminder. Simple beats clever most days.",
    ];

    internal static readonly DemoBotPersona[] Bots =
    [
        new(
            "sarah.chen",
            "sarah.chen@demo.linkup",
            "Sarah",
            "Chen",
            "Senior Product Designer · Design systems",
            "San Francisco, CA",
            [
                "Shipped a new onboarding flow this week — early tests show +18% completion. Grateful for a sharp eng team.",
                "Hot take: the best design reviews start with user quotes, not pixel debates.",
                "Looking for mentors in accessibility-first product work. Any recommendations?",
                "Friday sketch session turned into a full prototype. Love when exploration pays off fast.",
            ]),
        new(
            "marcus.johnson",
            "marcus.johnson@demo.linkup",
            "Marcus",
            "Johnson",
            "DevOps Engineer · Kubernetes & CI/CD",
            "Austin, TX",
            [
                "Cut deploy time from 22 min to 6 min by parallelizing integration tests. Small wins compound.",
                "Our staging cluster finally mirrors prod traffic patterns. Sleep quality improved accordingly.",
                "Sharing our runbook template for incident response — happy to DM a copy.",
                "Reminder: backups you do not test are just wishful thinking.",
            ]),
        new(
            "elena.koval",
            "elena.koval@demo.linkup",
            "Elena",
            "Koval",
            "UX Researcher · B2B SaaS",
            "Warsaw, Poland",
            [
                "Finished 14 user interviews for the messaging redesign. Patterns are clearer than we expected.",
                "Researchers and PMMs should pair on synthesis days more often. Alignment gets much easier.",
                "Published notes on diary studies for remote teams — link in comments if useful.",
                "Coffee + Miro boards = my favorite combo this quarter.",
            ]),
        new(
            "james.obrien",
            "james.obrien@demo.linkup",
            "James",
            "O'Brien",
            "Backend Developer · .NET & PostgreSQL",
            "Dublin, Ireland",
            [
                "Refactored our feed query and dropped p95 latency by 40%. Indexes matter.",
                "Enjoying modular monolith patterns more than I expected — clear boundaries without ops pain.",
                "Open to chatting about event-driven workflows in mid-size products.",
                "Weekend project: tiny CLI for migration smoke tests. Sometimes tools are the feature.",
            ]),
        new(
            "priya.sharma",
            "priya.sharma@demo.linkup",
            "Priya",
            "Sharma",
            "Data Scientist · ML in production",
            "Bengaluru, India",
            [
                "Deployed a lightweight churn model with weekly retraining. Monitoring is half the battle.",
                "Data teams: document feature definitions like code. Future you will send thanks.",
                "Great panel today on responsible AI in hiring products. Lots to unpack.",
                "Visualized user retention cohorts for leadership — storytelling still wins over raw metrics.",
            ]),
        new(
            "oleksii.melnyk",
            "oleksii.melnyk@demo.linkup",
            "Oleksii",
            "Melnyk",
            "Front-end Developer · React & TypeScript",
            "Kyiv, Ukraine",
            [
                "Підключив lazy-loading для стрічки — TTI відчутно кращий на мобільних.",
                "Code review tip: ask what problem the PR solves before commenting on syntax.",
                "Шукаю цікаві pet-проєкти з WebRTC. Пишіть у DM.",
                "Shipped dark mode tokens across the app. Consistency > one-off fixes.",
            ]),
        new(
            "nina.petrov",
            "nina.petrov@demo.linkup",
            "Nina",
            "Petrov",
            "HR Business Partner · Tech hiring",
            "Berlin, Germany",
            [
                "Hired three engineers this month with structured scorecards — bias down, signal up.",
                "Candidates appreciate transparent timelines. Silence costs more than a 'no'.",
                "Hosting a virtual coffee chat for junior devs next Tuesday. DM for invite.",
                "Culture is what you reward repeatedly, not what is written on the wall.",
            ]),
        new(
            "david.kim",
            "david.kim@demo.linkup",
            "David",
            "Kim",
            "Founder · B2B collaboration tools",
            "Seoul, South Korea",
            [
                "Closed our seed extension. Now the real work begins — hiring and focus.",
                "Startups: pick one metric that matters this quarter and ignore the rest.",
                "Grateful for advisors who challenge assumptions without killing momentum.",
                "Demo day feedback: simplify the pitch, deepen the onboarding.",
            ]),
        new(
            "lisa.mueller",
            "lisa.mueller@demo.linkup",
            "Lisa",
            "Müller",
            "Marketing Lead · Developer tools",
            "Munich, Germany",
            [
                "Launched a case study series featuring customer engineering teams. Authentic stories convert.",
                "Stop writing feature lists — write outcomes your buyer can repeat in meetings.",
                "A/B tested two landing heroes. Specificity beat cleverness again.",
                "Team offsite recap: align on ICP before campaigns, not after.",
            ]),
        new(
            "ahmed.hassan",
            "ahmed.hassan@demo.linkup",
            "Ahmed",
            "Hassan",
            "Cloud Architect · Azure & AWS",
            "Dubai, UAE",
            [
                "Migrated a legacy service to containers without downtime. Runbooks saved us twice.",
                "FinOps lesson: tag everything on day one or pay for it in spreadsheets later.",
                "Sharing our reference architecture for multi-region failover.",
                "Security review found one overly permissive role. Fixed before it became folklore.",
            ]),
        new(
            "maria.santos",
            "maria.santos@demo.linkup",
            "Maria",
            "Santos",
            "QA Engineer · Automation & quality culture",
            "São Paulo, Brazil",
            [
                "Flaky tests are product bugs wearing a testing costume. Triage them like P1s.",
                "Added contract tests between facade and content modules — fewer surprises in staging.",
                "Quality is a team sport. Thanks devs for pairing on repro steps this sprint.",
                "Release confidence went up when we started testing realistic data volumes.",
            ]),
        new(
            "yuki.tanaka",
            "yuki.tanaka@demo.linkup",
            "Yuki",
            "Tanaka",
            "Mobile Developer · React Native",
            "Tokyo, Japan",
            [
                "Improved cold start time on Android by lazy-loading native modules.",
                "Offline-first messaging prototype is promising — early dogfood feedback welcome.",
                "Typed navigation routes caught three bugs before QA. Worth the setup cost.",
                "Cross-platform does not mean identical UX. Respect platform patterns.",
            ]),
        new(
            "chloe.martin",
            "chloe.martin@demo.linkup",
            "Chloe",
            "Martin",
            "Content Strategist · B2B brands",
            "Paris, France",
            [
                "Repurposed one webinar into six LinkedIn posts and a newsletter. Work smarter.",
                "Voice and tone docs are underrated infrastructure for growing teams.",
                "Interviewed a customer success lead — gold for product marketing angles.",
                "Publishing consistently beats publishing perfectly. Momentum matters.",
            ]),
        new(
            "ryan.cooper",
            "ryan.cooper@demo.linkup",
            "Ryan",
            "Cooper",
            "Cybersecurity Analyst · AppSec",
            "London, UK",
            [
                "Ran a tabletop exercise for credential stuffing scenarios. Gaps found, gaps fixed.",
                "Developers are allies, not blockers, in security programs.",
                "Threat modeling session surfaced two quick wins we shipped same week.",
                "Security awareness works when examples are real and relevant.",
            ]),
        new(
            "tom.bradley",
            "tom.bradley@demo.linkup",
            "Tom",
            "Bradley",
            "Scrum Master · Agile coach",
            "Toronto, Canada",
            [
                "Sprint retro theme: reduce work in progress. Team committed to two experiments.",
                "Facilitation tip: silence after a question is fine. Let people think.",
                "Cross-team dependency map finally on the wall. Everyone breathed easier.",
                "Celebrating small deliveries keeps morale up during long migrations.",
            ]),
        new(
            "nina.petrov",
            "nina.petrov@demo.linkup",
            "Nina",
            "Petrov",
            "Data Engineer · Analytics platforms",
            "Berlin, Germany",
            [
                "Shipped a dbt model that cut nightly pipeline runtime by 40%. Small schema wins matter.",
                "Data contracts between teams reduced surprise breaking changes this quarter.",
                "Started documenting lineage for our top ten dashboards. Onboarding got easier overnight.",
                "Batch vs streaming is a trade-off conversation, not a religion. Context wins.",
            ]),
        new(
            "jason.liu",
            "jason.liu@demo.linkup",
            "Jason",
            "Liu",
            "ML Engineer · Recommendation systems",
            "Singapore",
            [
                "Offline evaluation looked great; online A/B told a humbler story. Ship carefully.",
                "Feature store cleanup freed two engineers for higher-leverage model work.",
                "Shared a postmortem on a silent model drift incident. Transparency builds trust.",
                "Latency budgets force better architecture. Constraints are gifts.",
            ]),
        new(
            "olivia.santos",
            "olivia.santos@demo.linkup",
            "Olivia",
            "Santos",
            "HR Business Partner · Tech scale-ups",
            "São Paulo, Brazil",
            [
                "Manager office hours this month: promotion paths and feedback loops.",
                "Onboarding buddy program cut time-to-first-PR for new hires.",
                "Celebrated three internal transfers into engineering. Mobility keeps talent engaged.",
                "Comp conversations go better with clear leveling rubrics. Clarity reduces anxiety.",
            ]),
        new(
            "mark.fischer",
            "mark.fischer@demo.linkup",
            "Mark",
            "Fischer",
            "Sales Director · Enterprise SaaS",
            "Munich, Germany",
            [
                "Closed a multi-year deal after six months of consultative discovery. Patience paid off.",
                "Sales and product sync weekly now. Fewer surprise roadmap questions in calls.",
                "Shared a win/loss analysis with the team. Learning beats celebrating alone.",
                "Champion-building tip: teach your contact something useful every interaction.",
            ]),
        new(
            "yuki.tanaka",
            "yuki.tanaka@demo.linkup",
            "Yuki",
            "Tanaka",
            "UI Engineer · Design systems",
            "Tokyo, Japan",
            [
                "Token migration to CSS variables unblocked dark mode across three apps.",
                "Storybook visual tests caught a regression before release. Worth the setup time.",
                "Pairing with design on spacing scales reduced back-and-forth in reviews.",
                "Accessibility fixes in the button component helped every team at once.",
            ]),
    ];

    internal static string AvatarUrlFor(string seed) =>
        $"https://api.dicebear.com/7.x/avataaars/svg?seed={Uri.EscapeDataString(seed)}";

    internal static string ImageUrlFor(DemoBotPersona persona, int postIndex) =>
        $"https://picsum.photos/seed/{Uri.EscapeDataString($"{persona.UserName}-post-{postIndex}")}/960/540";

    internal static string ImageCaptionFor(DemoBotPersona persona, int postIndex) =>
        $"{EnrichedMarker} {persona.FirstName} {persona.LastName} · {persona.Headline} · {persona.Location} (#{postIndex + 1})";

    internal static string EnrichPostContent(string content, string caption)
    {
        if (content.Contains(EnrichedMarker, StringComparison.Ordinal))
        {
            return content;
        }

        return $"{content.TrimEnd()}\n\n{caption}";
    }

    internal static string[] PickComments(int globalPostIndex)
    {
        var first = CommentPool[globalPostIndex % CommentPool.Length];
        var second = CommentPool[(globalPostIndex + 7) % CommentPool.Length];
        return first == second
            ? [first, CommentPool[(globalPostIndex + 3) % CommentPool.Length]]
            : [first, second];
    }

    internal static DemoBotPersona? FindPersonaByEmail(string email) =>
        Bots.FirstOrDefault(bot => string.Equals(bot.Email, email, StringComparison.OrdinalIgnoreCase));

    internal static string StripEnrichedCaption(string content)
    {
        var markerIndex = content.IndexOf(EnrichedMarker, StringComparison.Ordinal);
        return markerIndex < 0 ? content.Trim() : content[..markerIndex].TrimEnd();
    }
}
