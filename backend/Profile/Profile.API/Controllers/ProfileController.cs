using Microsoft.AspNetCore.Mvc;
using Profile.Contracts.DTOs;
using Profile.Contracts.Parameters;
using Profile.Contracts.Services;

namespace Profile.API.Controllers;

[ApiController]
[Route("api/internal/profile")]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;

    public ProfileController(IProfileService profileService)
    {
        _profileService = profileService;
    }

    // GET api/internal/profile/{userId}
    [HttpGet("{userId}")]
    [ProducesResponseType(typeof(UserProfileDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetByUserId(string userId)
    {
        var profile = await _profileService.GetAsync(new GetProfileByUserIdParameters
        {
            UserId = userId
        });

        if (profile == null)
            return NotFound();

        return Ok(profile);
    }

    // PUT api/internal/profile/{userId}
    [HttpPut("{userId}")]
    [ProducesResponseType(typeof(UserProfileDto), 200)]
    public async Task<IActionResult> UpdateByUserId(
        string userId,
        [FromBody] UserProfileDto profile)
    {
        var profileToUpdate = profile with
        {
            UserId = userId
        };

        var updatedProfile = await _profileService.UpdateAsync(profileToUpdate);

        return Ok(updatedProfile);
    }



    // POST api/internal/profile/{userId}/avatar
    [HttpPost("{userId}/avatar")]
    [ProducesResponseType(typeof(UserProfileDto), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> UploadAvatar(string userId, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("File is empty.");

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (!allowedExtensions.Contains(extension))
            return BadRequest("Only jpg, jpeg, png and webp files are allowed.");

        var uploadsRoot = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        var userAvatarFolder = Path.Combine(uploadsRoot, "profile", userId, "avatar");

        if (!Directory.Exists(userAvatarFolder))
        {
            Directory.CreateDirectory(userAvatarFolder);
        }

        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(userAvatarFolder, fileName);

        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var avatarUrl = $"/uploads/profile/{userId}/avatar/{fileName}";

        var existingProfile = await _profileService.GetAsync(new GetProfileByUserIdParameters
        {
            UserId = userId
        });

        var profileToUpdate = existingProfile ?? new UserProfileDto
        {
            UserId = userId
        };

        profileToUpdate = profileToUpdate with
        {
            AvatarUrl = avatarUrl
        };

        var updatedProfile = await _profileService.UpdateAsync(profileToUpdate);

        return Ok(updatedProfile);
    }


    // POST api/internal/profile/{userId}/header
    [HttpPost("{userId}/header")]
    [ProducesResponseType(typeof(UserProfileDto), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> UploadHeader(string userId, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("File is empty.");

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (!allowedExtensions.Contains(extension))
            return BadRequest("Only jpg, jpeg, png and webp files are allowed.");

        var uploadsRoot = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        var userHeaderFolder = Path.Combine(uploadsRoot, "profile", userId, "header");

        if (!Directory.Exists(userHeaderFolder))
        {
            Directory.CreateDirectory(userHeaderFolder);
        }

        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(userHeaderFolder, fileName);

        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var headerUrl = $"/uploads/profile/{userId}/header/{fileName}";

        var existingProfile = await _profileService.GetAsync(new GetProfileByUserIdParameters
        {
            UserId = userId
        });

        var profileToUpdate = existingProfile ?? new UserProfileDto
        {
            UserId = userId
        };

        profileToUpdate = profileToUpdate with
        {
            HeaderUrl = headerUrl
        };

        var updatedProfile = await _profileService.UpdateAsync(profileToUpdate);

        return Ok(updatedProfile);
    }
}