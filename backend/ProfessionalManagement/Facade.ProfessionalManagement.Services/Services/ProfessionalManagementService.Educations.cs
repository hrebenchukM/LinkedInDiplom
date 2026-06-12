using Facade.ProfessionalManagement.Contracts.DTOs;
using Facade.ProfessionalManagement.Contracts.Requests.Education;
using Facade.ProfessionalManagement.Contracts.Responses;
using Professional.Contracts.Parameters.Education;

namespace Facade.ProfessionalManagement.Services.Services;

public partial class ProfessionalManagementService
{
    // Получить всё моё образование
    public async Task<IReadOnlyCollection<EducationDto>> GetMyEducationsAsync(string userId)
    {
        var educations = await _professionalClient.Educations.GetUserEducationsAsync(
            new GetUserEducationsParameters
            {
                UserId = userId
            });

        return educations
            .Select(MapEducationToFacadeDto)
            .ToList();
    }

    // Получить одну запись об образовании по Id
    public async Task<EducationDto?> GetMyEducationByIdAsync(string userId, Guid educationId)
    {
        var education = await _professionalClient.Educations.GetByIdAsync(
            new GetEducationByIdParameters
            {
                UserId = userId,
                EducationId = educationId
            });

        return education == null ? null : MapEducationToFacadeDto(education);
    }

    // Создать запись об образовании
    public async Task<EducationResponse> CreateMyEducationAsync(
        string userId,
        CreateEducationRequest request)
    {
        var result = await _professionalClient.Educations.CreateAsync(
            new CreateEducationParameters
            {
                UserId = userId,
                AcademyId = request.AcademyId,
                Institution = request.Institution,
                Degree = request.Degree,
                FieldOfStudy = request.FieldOfStudy,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Source = request.Source
            });

        return new EducationResponse
        {
            Success = result.Succeeded,
            Education = result.Education == null ? null : MapEducationToFacadeDto(result.Education),
            Errors = result.Errors
        };
    }

    // Полностью обновить запись об образовании
    public async Task<EducationResponse> UpdateMyEducationAsync(
        string userId,
        Guid educationId,
        UpdateEducationRequest request)
    {
        var result = await _professionalClient.Educations.UpdateAsync(
            new UpdateEducationParameters
            {
                UserId = userId,
                EducationId = educationId,
                AcademyId = request.AcademyId,
                Institution = request.Institution,
                Degree = request.Degree,
                FieldOfStudy = request.FieldOfStudy,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Source = request.Source
            });

        return new EducationResponse
        {
            Success = result.Succeeded,
            Education = result.Education == null ? null : MapEducationToFacadeDto(result.Education),
            Errors = result.Errors
        };
    }

    // Частично обновить запись об образовании
    public async Task<EducationResponse> PatchMyEducationAsync(
        string userId,
        Guid educationId,
        PatchEducationRequest request)
    {
        var result = await _professionalClient.Educations.PatchAsync(
            new PatchEducationParameters
            {
                UserId = userId,
                EducationId = educationId,
                AcademyId = request.AcademyId,
                Institution = request.Institution,
                Degree = request.Degree,
                FieldOfStudy = request.FieldOfStudy,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Source = request.Source
            });

        return new EducationResponse
        {
            Success = result.Succeeded,
            Education = result.Education == null ? null : MapEducationToFacadeDto(result.Education),
            Errors = result.Errors
        };
    }

    // Удалить запись об образовании
    public async Task<EducationResponse> DeleteMyEducationAsync(
        string userId,
        Guid educationId)
    {
        var result = await _professionalClient.Educations.DeleteAsync(
            new DeleteEducationParameters
            {
                UserId = userId,
                EducationId = educationId
            });

        return new EducationResponse
        {
            Success = result.Succeeded,
            Education = result.Education == null ? null : MapEducationToFacadeDto(result.Education),
            Errors = result.Errors
        };
    }

    private static EducationDto MapEducationToFacadeDto(Professional.Contracts.DTOs.EducationDto education)
    {
        return new EducationDto
        {
            Id = education.Id,
            UserId = education.UserId,
            AcademyId = education.AcademyId,
            Institution = education.Institution,
            Degree = education.Degree,
            FieldOfStudy = education.FieldOfStudy,
            StartDate = education.StartDate,
            EndDate = education.EndDate,
            Source = education.Source,
            CreatedAt = education.CreatedAt,
            UpdatedAt = education.UpdatedAt
        };
    }
}
