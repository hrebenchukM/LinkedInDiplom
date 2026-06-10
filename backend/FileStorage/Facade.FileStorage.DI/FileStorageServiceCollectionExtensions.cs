using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Facade.FileStorage.Contracts.Options;
using Facade.FileStorage.Contracts.Services;
using Facade.FileStorage.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Facade.FileStorage.DI;

public static class FileStorageServiceCollectionExtensions
{
    public static IServiceCollection AddFileStorage(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<AwsS3Settings>(configuration.GetSection("AwsS3"));

        services.AddOptions<FileStorageOptions>()
            .Bind(configuration.GetSection("FileStorage"))
            .PostConfigure<IHostEnvironment>((options, environment) =>
            {
                options.UploadsRootPath = ResolveUploadsRootPath(
                    configuration,
                    environment.ContentRootPath);
            });

        var s3Settings = configuration.GetSection("AwsS3").Get<AwsS3Settings>();

        if (s3Settings != null && !string.IsNullOrWhiteSpace(s3Settings.BucketName))
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

        services.AddScoped<IFileStorageService, FileStorageService>();

        return services;
    }

    private static string ResolveUploadsRootPath(IConfiguration configuration, string contentRootPath)
    {
        var configuredPath = configuration["FileStorage:UploadsRootPath"];

        if (string.IsNullOrWhiteSpace(configuredPath))
            return Path.GetFullPath(Path.Combine(contentRootPath, "uploads"));

        return Path.IsPathRooted(configuredPath)
            ? Path.GetFullPath(configuredPath)
            : Path.GetFullPath(Path.Combine(contentRootPath, configuredPath));
    }
}
