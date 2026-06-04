using Facade.ProfessionalManagement.Contracts.DTOs;
using Facade.ProfessionalManagement.Contracts.Requests.Certificate;
using Facade.ProfessionalManagement.Contracts.Requests.CertificateSkill;
using Facade.ProfessionalManagement.Contracts.Responses;
using Professional.Contracts.Parameters.Certificate;
using Professional.Contracts.Parameters.CertificateSkill;

namespace Facade.ProfessionalManagement.Services.Services;

public partial class ProfessionalManagementService
{
    // Получить все мои сертификаты
    public async Task<IReadOnlyCollection<CertificateDto>> GetMyCertificatesAsync(string userId)
    {
        var certificates = await _professionalClient.Certificates.GetUserCertificatesAsync(
            new GetUserCertificatesParameters
            {
                UserId = userId
            });

        return certificates
            .Select(MapCertificateToFacadeDto)
            .ToList();
    }

    // Получить один мой сертификат по Id
    public async Task<CertificateDto?> GetMyCertificateByIdAsync(string userId, Guid certificateId)
    {
        var certificate = await _professionalClient.Certificates.GetByIdAsync(
            new GetCertificateByIdParameters
            {
                UserId = userId,
                CertificateId = certificateId
            });

        return certificate == null ? null : MapCertificateToFacadeDto(certificate);
    }

    // Создать сертификат
    public async Task<CertificateResponse> CreateMyCertificateAsync(
        string userId,
        CreateCertificateRequest request)
    {
        var result = await _professionalClient.Certificates.CreateAsync(
            new CreateCertificateParameters
            {
                UserId = userId,
                AcademyId = request.AcademyId,
                Name = request.Name,
                DownloadRef = request.DownloadRef,
                IssueDate = request.IssueDate,
                ExpiryDate = request.ExpiryDate,
                AccreditationId = request.AccreditationId,
                OrganizationUrl = request.OrganizationUrl
            });

        return new CertificateResponse
        {
            Success = result.Succeeded,
            Certificate = result.Certificate == null ? null : MapCertificateToFacadeDto(result.Certificate),
            Errors = result.Errors
        };
    }

    // Полностью обновить сертификат
    public async Task<CertificateResponse> UpdateMyCertificateAsync(
        string userId,
        Guid certificateId,
        UpdateCertificateRequest request)
    {
        var result = await _professionalClient.Certificates.UpdateAsync(
            new UpdateCertificateParameters
            {
                UserId = userId,
                CertificateId = certificateId,
                AcademyId = request.AcademyId,
                Name = request.Name,
                DownloadRef = request.DownloadRef,
                IssueDate = request.IssueDate,
                ExpiryDate = request.ExpiryDate,
                AccreditationId = request.AccreditationId,
                OrganizationUrl = request.OrganizationUrl
            });

        return new CertificateResponse
        {
            Success = result.Succeeded,
            Certificate = result.Certificate == null ? null : MapCertificateToFacadeDto(result.Certificate),
            Errors = result.Errors
        };
    }

    // Частично обновить сертификат
    public async Task<CertificateResponse> PatchMyCertificateAsync(
        string userId,
        Guid certificateId,
        PatchCertificateRequest request)
    {
        var result = await _professionalClient.Certificates.PatchAsync(
            new PatchCertificateParameters
            {
                UserId = userId,
                CertificateId = certificateId,
                AcademyId = request.AcademyId,
                Name = request.Name,
                DownloadRef = request.DownloadRef,
                IssueDate = request.IssueDate,
                ExpiryDate = request.ExpiryDate,
                AccreditationId = request.AccreditationId,
                OrganizationUrl = request.OrganizationUrl
            });

        return new CertificateResponse
        {
            Success = result.Succeeded,
            Certificate = result.Certificate == null ? null : MapCertificateToFacadeDto(result.Certificate),
            Errors = result.Errors
        };
    }

    // Удалить сертификат
    public async Task<CertificateResponse> DeleteMyCertificateAsync(
        string userId,
        Guid certificateId)
    {
        var result = await _professionalClient.Certificates.DeleteAsync(
            new DeleteCertificateParameters
            {
                UserId = userId,
                CertificateId = certificateId
            });

        return new CertificateResponse
        {
            Success = result.Succeeded,
            Certificate = result.Certificate == null ? null : MapCertificateToFacadeDto(result.Certificate),
            Errors = result.Errors
        };
    }

    // Получить навыки сертификата
    public async Task<IReadOnlyCollection<CertificateSkillDto>?> GetMyCertificateSkillsAsync(
        string userId,
        Guid certificateId)
    {
        var certificate = await GetMyCertificateByIdAsync(userId, certificateId);

        if (certificate == null)
            return null;

        var certificateSkills = await _professionalClient.CertificateSkills.GetCertificateSkillsAsync(
            new GetCertificateSkillsParameters
            {
                UserId = userId,
                CertificateId = certificateId
            });

        return certificateSkills
            .Select(MapCertificateSkillToFacadeDto)
            .ToList();
    }

    // Получить одну связку сертификата и навыка
    public async Task<CertificateSkillDto?> GetMyCertificateSkillByIdAsync(
        string userId,
        Guid certificateId,
        Guid certificateSkillId)
    {
        var certificate = await GetMyCertificateByIdAsync(userId, certificateId);

        if (certificate == null)
            return null;

        var certificateSkill = await _professionalClient.CertificateSkills.GetByIdAsync(
            new GetCertificateSkillByIdParameters
            {
                UserId = userId,
                CertificateId = certificateId,
                CertificateSkillId = certificateSkillId
            });

        return certificateSkill == null ? null : MapCertificateSkillToFacadeDto(certificateSkill);
    }

    // Добавить навык к сертификату
    public async Task<CertificateSkillResponse> CreateMyCertificateSkillAsync(
        string userId,
        Guid certificateId,
        CreateCertificateSkillRequest request)
    {
        var result = await _professionalClient.CertificateSkills.CreateAsync(
            new CreateCertificateSkillParameters
            {
                UserId = userId,
                CertificateId = certificateId,
                SkillId = request.SkillId
            });

        return new CertificateSkillResponse
        {
            Success = result.Succeeded,
            CertificateSkill = result.CertificateSkill == null
                ? null
                : MapCertificateSkillToFacadeDto(result.CertificateSkill),
            Errors = result.Errors
        };
    }

    // Удалить связку сертификата и навыка
    public async Task<CertificateSkillResponse> DeleteMyCertificateSkillAsync(
        string userId,
        Guid certificateId,
        Guid certificateSkillId)
    {
        var result = await _professionalClient.CertificateSkills.DeleteAsync(
            new DeleteCertificateSkillParameters
            {
                UserId = userId,
                CertificateId = certificateId,
                CertificateSkillId = certificateSkillId
            });

        return new CertificateSkillResponse
        {
            Success = result.Succeeded,
            CertificateSkill = result.CertificateSkill == null
                ? null
                : MapCertificateSkillToFacadeDto(result.CertificateSkill),
            Errors = result.Errors
        };
    }

    private static CertificateDto MapCertificateToFacadeDto(Professional.Contracts.DTOs.CertificateDto certificate)
    {
        return new CertificateDto
        {
            Id = certificate.Id,
            UserId = certificate.UserId,
            AcademyId = certificate.AcademyId,
            Name = certificate.Name,
            DownloadRef = certificate.DownloadRef,
            IssueDate = certificate.IssueDate,
            ExpiryDate = certificate.ExpiryDate,
            AccreditationId = certificate.AccreditationId,
            OrganizationUrl = certificate.OrganizationUrl,
            CreatedAt = certificate.CreatedAt,
            UpdatedAt = certificate.UpdatedAt
        };
    }

    private static CertificateSkillDto MapCertificateSkillToFacadeDto(
        Professional.Contracts.DTOs.CertificateSkillDto certificateSkill)
    {
        return new CertificateSkillDto
        {
            Id = certificateSkill.Id,
            CertificateId = certificateSkill.CertificateId,
            SkillId = certificateSkill.SkillId,
            CreatedAt = certificateSkill.CreatedAt
        };
    }
}
