using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Facade.ProfileManagement.Contracts.Options;
using Facade.ProfileManagement.Contracts.Services;
using Facade.ProfileManagement.Services.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Facade.ProfileManagement.DI;

public static class ProfileManagementFacadeServiceCollectionExtensions
{
    public static IServiceCollection AddProfileManagementFacade(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<AwsS3Settings>(configuration.GetSection("AwsS3"));

        var s3Settings = configuration.GetSection("AwsS3").Get<AwsS3Settings>();

        if (s3Settings != null && !string.IsNullOrEmpty(s3Settings.BucketName))
        {
            var region = RegionEndpoint.GetBySystemName(s3Settings.Region);

            var accessKeyId = s3Settings.AccessKeyId.Length > 0
                ? s3Settings.AccessKeyId
                : Environment.GetEnvironmentVariable("AWS_ACCESS_KEY_ID");

            var secretAccessKey = s3Settings.SecretAccessKey.Length > 0
                ? s3Settings.SecretAccessKey
                : Environment.GetEnvironmentVariable("AWS_SECRET_ACCESS_KEY");

            IAmazonS3 s3Client = !string.IsNullOrEmpty(accessKeyId) && !string.IsNullOrEmpty(secretAccessKey)
                ? new AmazonS3Client(new BasicAWSCredentials(accessKeyId, secretAccessKey), region)
                : new AmazonS3Client(region);

            services.AddSingleton(s3Client);
        }

        services.AddScoped<IProfileManagementService, ProfileManagementService>();

        return services;
    }
}
