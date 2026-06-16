using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using AI.Contracts.Configuration;
using AI.Contracts.DTOs;
using AI.Contracts.Services;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Professional.Client.Contracts;
using Professional.Contracts.Parameters.Education;
using Professional.Contracts.Parameters.Experience;
using Professional.Contracts.Parameters.Skill;
using Professional.Contracts.Parameters.UserSkill;

namespace AI.Services.Services;

public class AIService : IAIService
{
    private readonly IProfessionalClient _professionalClient;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly GeminiSettings _settings;
    private readonly ILogger<AIService> _logger;

    private class CareerAdviceRaw
    {
        [JsonPropertyName("summary")]
        public string Summary { get; set; } = string.Empty;
        [JsonPropertyName("strengths")]
        public List<string> Strengths { get; set; } = new();
        [JsonPropertyName("improvements")]
        public List<string> Improvements { get; set; } = new();
        [JsonPropertyName("suggestedSkills")]
        public List<string> SuggestedSkills { get; set; } = new();
    }

    private class JobRecommendationRaw
    {
        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;
        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;
        [JsonPropertyName("matchScore")]
        public int MatchScore { get; set; }
    }

    private static readonly Dictionary<string, (string Title, string Description, int Score)> SkillJobMap = new(StringComparer.OrdinalIgnoreCase)
    {
        ["c#"]         = ("C# / .NET Developer",      "Your C# skills are a strong match for .NET backend development.",        88),
        [".net"]       = (".NET Backend Developer",    "Solid .NET experience matches backend and API development roles.",        87),
        ["asp.net"]    = ("ASP.NET Web Developer",     "ASP.NET skills are ideal for web API and MVC development roles.",         86),
        ["react"]      = ("React Frontend Developer",  "React expertise is highly demanded for modern frontend positions.",       90),
        ["angular"]    = ("Angular Developer",         "Angular is widely used in enterprise frontend projects.",                 85),
        ["vue"]        = ("Vue.js Developer",          "Vue.js knowledge fits well with frontend and full-stack positions.",      83),
        ["javascript"] = ("Frontend Developer",        "JavaScript is the core skill for frontend and full-stack development.",   89),
        ["typescript"] = ("TypeScript Developer",      "TypeScript skills are valued in both frontend and Node.js roles.",        88),
        ["python"]     = ("Python Developer",          "Python is in high demand for backend, scripting, and data roles.",        91),
        ["java"]       = ("Java Developer",            "Java expertise suits enterprise backend and Android development.",        86),
        ["postgresql"] = ("Backend / Database Developer", "PostgreSQL skills match backend APIs and data platforms.",           85),
        ["postgres"]   = ("Backend / Database Developer", "PostgreSQL skills match backend APIs and data platforms.",           85),
        ["sql"]        = ("Database Developer",        "SQL skills are essential for backend, data, and reporting positions.",    80),
        ["docker"]     = ("DevOps / Cloud Engineer",   "Docker and containerisation skills fit well in DevOps roles.",           85),
        ["kubernetes"] = ("DevOps Engineer",           "Kubernetes is a core skill for cloud-native and DevOps positions.",      87),
        ["aws"]        = ("Cloud Solutions Architect", "AWS knowledge is highly valued across cloud and backend roles.",         90),
        ["azure"]      = ("Azure Developer",           "Azure skills match well with Microsoft-ecosystem cloud roles.",          88),
        ["node"]       = ("Node.js Developer",         "Node.js fits well with backend and full-stack JavaScript roles.",        87),
        ["golang"]     = ("Go Developer",              "Go is in demand for high-performance backend and microservice roles.",    85),
        ["rust"]       = ("Systems Developer",         "Rust skills match systems programming and performance-critical roles.",  84),
        ["flutter"]    = ("Flutter / Mobile Developer","Flutter knowledge suits cross-platform mobile development roles.",        86),
        ["swift"]      = ("iOS Developer",             "Swift is the primary language for iOS and macOS development.",           88),
        ["kotlin"]     = ("Android Developer",         "Kotlin is the preferred language for modern Android development.",       87),
    };

    public AIService(
        IProfessionalClient professionalClient,
        IHttpClientFactory httpClientFactory,
        IOptions<GeminiSettings> settings,
        ILogger<AIService> logger)
    {
        _professionalClient = professionalClient;
        _httpClientFactory = httpClientFactory;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<IReadOnlyCollection<JobRecommendationDto>> GetRecommendedJobsAsync(string userId)
    {
        var (profileSummary, skillNames) = await BuildProfileDataAsync(userId);

        _logger.LogInformation("[AI] Jobs request — userId={UserId}, skills={Skills}, profileEmpty={Empty}",
            userId, string.Join(", ", skillNames), string.IsNullOrEmpty(profileSummary));

        if (string.IsNullOrEmpty(profileSummary))
        {
            return new[]
            {
                new JobRecommendationDto
                {
                    Title = "No profile data",
                    Description = "Add skills, experience and education to get personalised recommendations.",
                    MatchScore = 0
                }
            };
        }

        var (raw, error) = await SendToGeminiAsync(BuildJobsPrompt(profileSummary));
        _logger.LogInformation("[AI] Raw Gemini jobs response:\n{Raw}", raw ?? $"(error: {error})");

        if (error == null && !string.IsNullOrWhiteSpace(raw))
        {
            var parsed = TryParseJobList(raw);
            if (parsed is { Count: > 0 })
            {
                _logger.LogInformation("[AI] Gemini returned {Count} job recommendations.", parsed.Count);
                return parsed;
            }
            _logger.LogWarning("[AI] Gemini job response could not be parsed. Falling back to skill-based matching.");
        }
        else
        {
            _logger.LogWarning("[AI] Gemini call failed: {Error}. Falling back to skill-based matching.", error);
        }

        return BuildFallbackJobRecommendations(skillNames);
    }

    public async Task<CareerAdviceDto> GetCareerAdviceAsync(string userId)
    {
        var (profileSummary, skillNames) = await BuildProfileDataAsync(userId);

        _logger.LogInformation("[AI] Career advice request — userId={UserId}, skills={Skills}, profileEmpty={Empty}",
            userId, string.Join(", ", skillNames), string.IsNullOrEmpty(profileSummary));

        if (string.IsNullOrEmpty(profileSummary))
        {
            return new CareerAdviceDto
            {
                Summary = "Add skills, experience and education to get personalised career advice."
            };
        }

        var (raw, error) = await SendToGeminiAsync(BuildAdvicePrompt(profileSummary));
        _logger.LogInformation("[AI] Raw Gemini career advice response:\n{Raw}", raw ?? $"(error: {error})");

        if (error == null && !string.IsNullOrWhiteSpace(raw))
        {
            var parsed = TryParseCareerAdvice(raw);
            if (parsed != null)
            {
                _logger.LogInformation("[AI] Gemini career advice parsed successfully.");
                return parsed;
            }
            _logger.LogWarning("[AI] Gemini career advice could not be parsed. Falling back to skill-based advice.");
        }
        else
        {
            _logger.LogWarning("[AI] Gemini call failed: {Error}. Falling back to skill-based advice.", error);
        }

        return BuildFallbackCareerAdvice(skillNames, profileSummary);
    }

    private static string BuildJobsPrompt(string profile) =>
        "You are a career advisor API. Your response must be ONLY a JSON array — nothing else.\n" +
        "Do NOT wrap the response in markdown. Do NOT use ```json. Do NOT add any text before or after the JSON.\n\n" +
        $"Professional profile:\n{profile}\n\n" +
        "Return a JSON array of exactly 5 job recommendations. Each element must have these fields:\n" +
        "  title (string), description (string, 1 sentence), matchScore (integer 0-100)\n\n" +
        "Example of required output format (output only this, no other text):\n" +
        "[{\"title\":\"Backend Developer\",\"description\":\"Your .NET skills match backend roles.\",\"matchScore\":90}]";

    private static string BuildAdvicePrompt(string profile) =>
        "You are a career advisor API. Your response must be ONLY a JSON object — nothing else.\n" +
        "Do NOT wrap the response in markdown. Do NOT use ```json. Do NOT add any text before or after the JSON.\n" +
        "All fields are required. Arrays must contain at least 2 items.\n\n" +
        $"Professional profile:\n{profile}\n\n" +
        "Return a JSON object with exactly these fields:\n" +
        "  summary (string, 2-3 sentences), strengths (array of strings), improvements (array of strings), suggestedSkills (array of strings)\n\n" +
        "Example of required output format (output only this, no other text):\n" +
        "{\"summary\":\"You have strong backend skills.\",\"strengths\":[\"C# expertise\",\"API design\"],\"improvements\":[\"Learn Docker\",\"Improve testing\"],\"suggestedSkills\":[\"Docker\",\"Kubernetes\"]}";

    private async Task<(string Summary, List<string> SkillNames)> BuildProfileDataAsync(string userId)
    {
        var sb = new StringBuilder();
        var skillNames = new List<string>();

        var userSkills = await _professionalClient.UserSkills.GetUserSkillsAsync(
            new GetUserSkillsParameters { UserId = userId });

        _logger.LogInformation("[AI] User {UserId} has {Count} skills.", userId, userSkills.Count);

        var skillEntries = new List<string>();
        foreach (var us in userSkills)
        {
            var skill = await _professionalClient.Skills.GetByIdAsync(
                new GetSkillByIdParameters { SkillId = us.SkillId });
            if (skill != null)
            {
                skillNames.Add(skill.Name);
                skillEntries.Add(skill.Name + (us.Level != null ? $" ({us.Level})" : ""));
            }
        }

        if (skillEntries.Count > 0)
            sb.AppendLine($"Skills: {string.Join(", ", skillEntries)}");

        var experiences = await _professionalClient.Experiences.GetUserExperiencesAsync(
            new GetUserExperiencesParameters { UserId = userId });

        _logger.LogInformation("[AI] User {UserId} has {Count} experiences.", userId, experiences.Count);

        if (experiences.Count > 0)
        {
            sb.AppendLine("Experience:");
            foreach (var exp in experiences)
            {
                var period = exp.EndDate != null
                    ? $"{exp.StartDate:yyyy-MM} – {exp.EndDate:yyyy-MM}"
                    : $"{exp.StartDate:yyyy-MM} – present";
                sb.AppendLine($"  - {exp.Position} ({period})");
            }
        }

        var educations = await _professionalClient.Educations.GetUserEducationsAsync(
            new GetUserEducationsParameters { UserId = userId });

        _logger.LogInformation("[AI] User {UserId} has {Count} educations.", userId, educations.Count);

        if (educations.Count > 0)
        {
            sb.AppendLine("Education:");
            foreach (var edu in educations)
            {
                var degree = edu.Degree != null ? $"{edu.Degree} in " : "";
                sb.AppendLine($"  - {degree}{edu.FieldOfStudy ?? ""} at {edu.Institution}");
            }
        }

        return (sb.ToString().Trim(), skillNames);
    }

    private async Task<(string? Text, string? Error)> SendToGeminiAsync(string prompt)
    {
        if (string.IsNullOrWhiteSpace(_settings.ApiKey))
        {
            _logger.LogWarning("[AI] Gemini API key is not configured. Skipping API call.");
            return (null, "Gemini API key is not configured.");
        }

        var client = _httpClientFactory.CreateClient();
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_settings.Model}:generateContent?key={_settings.ApiKey}";

        var body = new
        {
            contents = new[] { new { parts = new[] { new { text = prompt } } } },
            generationConfig = new { responseMimeType = "application/json" }
        };

        try
        {
            var response = await client.PostAsJsonAsync(url, body);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("[AI] Gemini HTTP {Status}. Body: {Body}", (int)response.StatusCode, responseBody);
                return (null, $"Gemini API returned HTTP {(int)response.StatusCode}");
            }

            using var doc = JsonDocument.Parse(responseBody);
            var text = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            return (text ?? string.Empty, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[AI] Exception calling Gemini API.");
            return (null, ex.Message);
        }
    }

    private static string ExtractJson(string raw, char open, char close)
    {
        var text = raw.Trim();
        if (text.StartsWith("```"))
        {
            var nl = text.IndexOf('\n');
            if (nl >= 0) text = text[(nl + 1)..];
        }
        if (text.EndsWith("```")) text = text[..^3].TrimEnd();
        text = text.Trim();

        var start = text.IndexOf(open);
        var end = text.LastIndexOf(close);
        if (start < 0 || end <= start) return text;
        return text[start..(end + 1)];
    }

    private List<JobRecommendationDto>? TryParseJobList(string raw)
    {
        try
        {
            var json = ExtractJson(raw, '[', ']');
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var items = JsonSerializer.Deserialize<List<JobRecommendationRaw>>(json, options);
            if (items == null || items.Count == 0) return null;
            return items.Select(i => new JobRecommendationDto
            {
                Title = i.Title,
                Description = i.Description,
                MatchScore = i.MatchScore
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[AI] TryParseJobList failed. Raw:\n{Raw}", raw);
            return null;
        }
    }

    private CareerAdviceDto? TryParseCareerAdvice(string raw)
    {
        try
        {
            var json = ExtractJson(raw, '{', '}');
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var item = JsonSerializer.Deserialize<CareerAdviceRaw>(json, options);
            if (item == null || string.IsNullOrWhiteSpace(item.Summary)) return null;
            return new CareerAdviceDto
            {
                Summary = item.Summary,
                Strengths = item.Strengths,
                Improvements = item.Improvements,
                SuggestedSkills = item.SuggestedSkills
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[AI] TryParseCareerAdvice failed. Raw:\n{Raw}", raw);
            return null;
        }
    }

    private static IReadOnlyCollection<JobRecommendationDto> BuildFallbackJobRecommendations(List<string> skillNames)
    {
        var results = new List<JobRecommendationDto>();

        foreach (var skill in skillNames)
        {
            if (SkillJobMap.TryGetValue(skill, out var job))
            {
                if (results.All(r => r.Title != job.Title))
                {
                    results.Add(new JobRecommendationDto
                    {
                        Title = job.Title,
                        Description = job.Description,
                        MatchScore = job.Score
                    });
                }
            }

            if (results.Count >= 5) break;
        }

        if (results.Count == 0)
        {
            results.Add(new JobRecommendationDto
            {
                Title = "Software Developer",
                Description = "Your technical background matches general software development roles.",
                MatchScore = 70
            });
        }

        return results;
    }

    private static CareerAdviceDto BuildFallbackCareerAdvice(List<string> skillNames, string profileSummary)
    {
        var skillList = skillNames.Count > 0
            ? string.Join(", ", skillNames)
            : "various technical areas";

        var strengths = new List<string> { $"Technical skills in {skillList}" };
        if (profileSummary.Contains("Experience:"))
            strengths.Add("Practical professional experience");
        if (profileSummary.Contains("Education:"))
            strengths.Add("Formal educational background");
        if (strengths.Count < 2)
            strengths.Add("Ability to learn and adapt to new technologies");

        return new CareerAdviceDto
        {
            Summary = $"Your profile shows expertise in {skillList}. " +
                      "Continue building on your technical foundation and expand into complementary areas to improve your career prospects.",
            Strengths = strengths,
            Improvements = new List<string>
            {
                "Consider obtaining industry-recognised certifications",
                "Expand your portfolio with personal or open-source projects",
                "Strengthen your soft skills through team collaboration"
            },
            SuggestedSkills = new List<string> { "Docker", "CI/CD pipelines", "Cloud platforms (AWS / Azure)" }
        };
    }
}
