using System.Net;
using System.Net.Http.Json;
using Profile.Client.Contracts.Services;
using Profile.Contracts.DTOs;

namespace Profile.Client.Services;

// Реализация HTTP-клиента для Profile.API
public class ProfileClient : IProfileClient
{
    private readonly HttpClient _httpClient;

    public ProfileClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    // GET /api/internal/profile/{userId}
    public async Task<UserProfileDto?> GetByUserIdAsync(string userId)
    {
        var response = await _httpClient.GetAsync($"api/internal/profile/{userId}");

        if (response.StatusCode == HttpStatusCode.NotFound)
            return null;

        response.EnsureSuccessStatusCode();

        return await response.Content.ReadFromJsonAsync<UserProfileDto>();
    }

    // PUT /api/internal/profile/{userId}
    public async Task<UserProfileDto> UpdateByUserIdAsync(string userId, UserProfileDto profile)
    {
        var response = await _httpClient.PutAsJsonAsync($"api/internal/profile/{userId}", profile);

        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<UserProfileDto>();

        return result ?? throw new InvalidOperationException("Profile API returned empty response.");
    }



    public async Task<UserProfileDto> UploadAvatarAsync(
    string userId,
    Stream fileStream,
    string fileName,
    string contentType)
    {
        using var content = new MultipartFormDataContent();

        var fileContent = new StreamContent(fileStream);
        fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(contentType);

        content.Add(fileContent, "file", fileName);

        var response = await _httpClient.PostAsync($"api/internal/profile/{userId}/avatar", content);

        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<UserProfileDto>();

        return result ?? throw new InvalidOperationException("Profile API returned empty response.");
    }

    public async Task<UserProfileDto> UploadHeaderAsync(
        string userId,
        Stream fileStream,
        string fileName,
        string contentType)
    {
        using var content = new MultipartFormDataContent();

        var fileContent = new StreamContent(fileStream);
        fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(contentType);

        content.Add(fileContent, "file", fileName);

        var response = await _httpClient.PostAsync($"api/internal/profile/{userId}/header", content);

        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<UserProfileDto>();

        return result ?? throw new InvalidOperationException("Profile API returned empty response.");
    }
}