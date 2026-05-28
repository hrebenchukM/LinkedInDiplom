using System.Security.Claims;
using Facade.ProfessionalManagement.Contracts.Responses;
using Facade.ProfessionalManagement.Contracts.Services;
using Microsoft.AspNetCore.Mvc;

namespace Facade.ProfessionalManagement.Controllers.Controllers;

[ApiController]
[Route("api/professional")]
/// <summary>
/// Базовый controller facade-слоя Professional.
/// Централизует common-логику: получение current user и перевод domain-ошибок в HTTP-коды.
/// </summary>
public abstract class ProfessionalManagementControllerBase : ControllerBase
{
    protected const string ExperienceNotFoundError = "Experience not found.";
    protected const string CompanyNotFoundError = "Company not found.";
    protected const string EducationNotFoundError = "Education not found.";
    protected const string AcademyNotFoundError = "Academy not found.";
    protected const string CertificateNotFoundError = "Certificate not found.";
    protected const string CertificateSkillNotFoundError = "Certificate skill not found.";
    protected const string SkillNotFoundError = "Skill not found.";
    protected const string UserSkillNotFoundError = "User skill not found.";
    protected const string LanguageNotFoundError = "Language not found.";
    protected const string UserLanguageNotFoundError = "User language not found.";
    protected const string RecommendationNotFoundError = "Recommendation not found.";
    protected const string RecommendedSkillNotFoundError = "Recommended skill not found.";

    protected IProfessionalManagementService ProfessionalService { get; }

    protected ProfessionalManagementControllerBase(IProfessionalManagementService professionalManagementService)
    {
        ProfessionalService = professionalManagementService;
    }

    private static readonly HashSet<string> ExperienceNotFoundErrors = new(StringComparer.Ordinal)
    {
        ExperienceNotFoundError,
        CompanyNotFoundError
    };

    private static readonly HashSet<string> CompanyNotFoundErrors = new(StringComparer.Ordinal)
    {
        CompanyNotFoundError
    };

    private static readonly HashSet<string> EducationNotFoundErrors = new(StringComparer.Ordinal)
    {
        EducationNotFoundError,
        AcademyNotFoundError
    };

    private static readonly HashSet<string> AcademyNotFoundErrors = new(StringComparer.Ordinal)
    {
        AcademyNotFoundError
    };

    private static readonly HashSet<string> CertificateNotFoundErrors = new(StringComparer.Ordinal)
    {
        CertificateNotFoundError,
        AcademyNotFoundError
    };

    private static readonly HashSet<string> CertificateSkillNotFoundErrors = new(StringComparer.Ordinal)
    {
        CertificateNotFoundError,
        CertificateSkillNotFoundError,
        SkillNotFoundError
    };

    private static readonly HashSet<string> UserSkillNotFoundErrors = new(StringComparer.Ordinal)
    {
        UserSkillNotFoundError,
        SkillNotFoundError
    };

    private static readonly HashSet<string> CatalogSkillNotFoundErrors = new(StringComparer.Ordinal)
    {
        SkillNotFoundError
    };

    private static readonly HashSet<string> UserLanguageNotFoundErrors = new(StringComparer.Ordinal)
    {
        UserLanguageNotFoundError,
        LanguageNotFoundError
    };

    private static readonly HashSet<string> CatalogLanguageNotFoundErrors = new(StringComparer.Ordinal)
    {
        LanguageNotFoundError
    };

    private static readonly HashSet<string> RecommendationNotFoundErrors = new(StringComparer.Ordinal)
    {
        RecommendationNotFoundError
    };

    private static readonly HashSet<string> RecommendedSkillNotFoundErrors = new(StringComparer.Ordinal)
    {
        RecommendedSkillNotFoundError,
        SkillNotFoundError
    };

    protected IActionResult MapExperienceError(ExperienceResponse response) =>
        MapErrors(response, response.Errors, ExperienceNotFoundErrors);

    protected IActionResult MapCompanyError(CompanyResponse response) =>
        MapErrors(response, response.Errors, CompanyNotFoundErrors);

    protected IActionResult MapEducationError(EducationResponse response) =>
        MapErrors(response, response.Errors, EducationNotFoundErrors);

    protected IActionResult MapAcademyError(AcademyResponse response) =>
        MapErrors(response, response.Errors, AcademyNotFoundErrors);

    protected IActionResult MapCertificateError(CertificateResponse response) =>
        MapErrors(response, response.Errors, CertificateNotFoundErrors);

    protected IActionResult MapCertificateSkillError(CertificateSkillResponse response) =>
        MapErrors(response, response.Errors, CertificateSkillNotFoundErrors);

    protected IActionResult MapSkillError(SkillResponse response) =>
        MapErrors(response, response.Errors, CatalogSkillNotFoundErrors);

    protected IActionResult MapUserSkillError(UserSkillResponse response) =>
        MapErrors(response, response.Errors, UserSkillNotFoundErrors);

    protected IActionResult MapLanguageError(LanguageResponse response) =>
        MapErrors(response, response.Errors, CatalogLanguageNotFoundErrors);

    protected IActionResult MapUserLanguageError(UserLanguageResponse response) =>
        MapErrors(response, response.Errors, UserLanguageNotFoundErrors);

    protected IActionResult MapRecommendationError(RecommendationResponse response) =>
        MapErrors(response, response.Errors, RecommendationNotFoundErrors);

    protected IActionResult MapRecommendedSkillError(RecommendedSkillByPositionResponse response) =>
        MapErrors(response, response.Errors, RecommendedSkillNotFoundErrors);

    protected string? GetCurrentUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub");

    protected IActionResult MapErrors<TResponse>(
        TResponse response,
        IEnumerable<string> errors,
        IReadOnlySet<string> notFoundErrors)
    {
        if (errors.Any(notFoundErrors.Contains))
            return new NotFoundObjectResult(response);

        return new BadRequestObjectResult(response);
    }
}
