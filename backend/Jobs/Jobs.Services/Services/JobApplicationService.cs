using Identity.Events.Contracts.Abstractions;
using Jobs.Contracts.DTOs;
using Jobs.Contracts.Parameters.JobApplication;
using Jobs.Contracts.Results;
using Jobs.Contracts.Services;
using Jobs.DataAccess;
using Jobs.DataAccess.Entities;
using Jobs.Events.Contracts.Events;
using Microsoft.EntityFrameworkCore;

namespace Jobs.Services.Services;

public class JobApplicationService(
    JobsDbContext dbContext,
    IDomainEventPublisher domainEventPublisher) : IJobApplicationService
{
    public async Task<JobApplicationResult> ApplyAsync(ApplyToVacancyParameters parameters)
    {
        var vacancy = await dbContext.Vacancies
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.Id == parameters.VacancyId && v.DeletedAt == null);

        if (vacancy is null)
        {
            return new JobApplicationResult
            {
                Succeeded = false,
                Errors = ["Vacancy not found."]
            };
        }

        if (vacancy.PostedBy == parameters.UserId)
        {
            return new JobApplicationResult
            {
                Succeeded = false,
                Errors = ["Cannot apply to your own vacancy."]
            };
        }

        var application = await dbContext.JobApplications
            .FirstOrDefaultAsync(a => a.UserId == parameters.UserId && a.VacancyId == parameters.VacancyId);

        if (application is not null && application.WithdrawnAt is null)
        {
            return new JobApplicationResult
            {
                Succeeded = false,
                Errors = ["Application already exists."]
            };
        }

        if (application is not null)
        {
            application.WithdrawnAt = null;
            application.AppliedAt = DateTime.UtcNow;
            application.Status = "applied";
            application.StatusChangedAt = null;
        }
        else
        {
            application = new JobApplication
            {
                Id = Guid.NewGuid(),
                VacancyId = parameters.VacancyId,
                UserId = parameters.UserId,
                Status = "applied",
                AppliedAt = DateTime.UtcNow,
                StatusChangedAt = null,
                WithdrawnAt = null
            };

            dbContext.JobApplications.Add(application);
        }

        await dbContext.SaveChangesAsync();

        await domainEventPublisher.PublishAsync(new VacancyApplicationSubmittedEvent
        {
            ApplicationId = application.Id,
            VacancyId = vacancy.Id,
            VacancyTitle = vacancy.Title,
            ApplicantUserId = application.UserId,
            PostedByUserId = vacancy.PostedBy,
            AppliedAt = application.AppliedAt
        });

        return new JobApplicationResult
        {
            Succeeded = true,
            JobApplication = Map(application, vacancy)
        };
    }

    public async Task<JobApplicationResult> WithdrawAsync(WithdrawJobApplicationParameters parameters)
    {
        var application = await dbContext.JobApplications
            .FirstOrDefaultAsync(a =>
                a.Id == parameters.ApplicationId &&
                a.UserId == parameters.UserId &&
                a.WithdrawnAt == null);

        if (application is null)
        {
            return new JobApplicationResult
            {
                Succeeded = false,
                Errors = ["Application not found."]
            };
        }

        var now = DateTime.UtcNow;
        application.WithdrawnAt = now;
        application.Status = "withdrawn";
        application.StatusChangedAt = now;

        await dbContext.SaveChangesAsync();

        return new JobApplicationResult
        {
            Succeeded = true,
            JobApplication = Map(application, null)
        };
    }

    public async Task<IReadOnlyCollection<JobApplicationDto>> GetMyApplicationsAsync(GetMyJobApplicationsParameters parameters)
    {
        var applications = await dbContext.JobApplications
            .AsNoTracking()
            .Where(a => a.UserId == parameters.UserId && a.WithdrawnAt == null)
            .OrderByDescending(a => a.AppliedAt)
            .ToListAsync();

        var vacancyIds = applications.Select(a => a.VacancyId).Distinct().ToList();
        var vacancies = await dbContext.Vacancies
            .AsNoTracking()
            .Where(v => v.DeletedAt == null && vacancyIds.Contains(v.Id))
            .ToDictionaryAsync(v => v.Id, v => v);

        return applications
            .Select(a =>
            {
                vacancies.TryGetValue(a.VacancyId, out var vacancy);
                return Map(a, vacancy);
            })
            .ToList();
    }

    public async Task<IReadOnlyCollection<JobApplicationDto>> GetVacancyApplicationsAsync(GetVacancyApplicationsParameters parameters)
    {
        var vacancy = await dbContext.Vacancies
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.Id == parameters.VacancyId && v.DeletedAt == null && v.PostedBy == parameters.UserId);

        if (vacancy is null)
            return Array.Empty<JobApplicationDto>();

        var applications = await dbContext.JobApplications
            .AsNoTracking()
            .Where(a => a.VacancyId == parameters.VacancyId && a.WithdrawnAt == null)
            .OrderByDescending(a => a.AppliedAt)
            .ToListAsync();

        return applications
            .Select(a => Map(a, vacancy))
            .ToList();
    }

    private static JobApplicationDto Map(JobApplication application, Vacancy? vacancy) =>
        new()
        {
            Id = application.Id,
            VacancyId = application.VacancyId,
            UserId = application.UserId,
            Status = application.Status,
            AppliedAt = application.AppliedAt,
            StatusChangedAt = application.StatusChangedAt,
            WithdrawnAt = application.WithdrawnAt,
            Vacancy = vacancy is null
                ? null
                : new VacancyDto
                {
                    Id = vacancy.Id,
                    CompanyId = vacancy.CompanyId,
                    PostedBy = vacancy.PostedBy,
                    Title = vacancy.Title,
                    JobType = vacancy.JobType,
                    Schedule = vacancy.Schedule,
                    Location = vacancy.Location,
                    SalaryFrom = vacancy.SalaryFrom,
                    SalaryTo = vacancy.SalaryTo,
                    SalaryCurrency = vacancy.SalaryCurrency,
                    Description = vacancy.Description,
                    PostedAt = vacancy.PostedAt,
                    UpdatedAt = vacancy.UpdatedAt
                }
        };
}
