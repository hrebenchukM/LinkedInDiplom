using Microsoft.EntityFrameworkCore;
using Network.Contracts.Parameters.Contact;
using Network.DataAccess;
using Network.DataAccess.Entities;
using Network.Services.Services;

namespace LinkedIn.Tests;

public class ContactServiceTests : IDisposable
{
    private readonly NetworkDbContext _dbContext;
    private readonly ContactService _contactService;
    private readonly string _userId = Guid.NewGuid().ToString();
    private readonly string _otherUserId = Guid.NewGuid().ToString();

    public ContactServiceTests()
    {
        var options = new DbContextOptionsBuilder<NetworkDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _dbContext = new NetworkDbContext(options);
        _contactService = new ContactService(_dbContext);
    }

    [Fact]
    public async Task SendRequest_Valid_ReturnsSuccess()
    {
        var result = await _contactService.SendRequestAsync(new SendContactRequestParameters
        {
            RequesterId = _userId,
            ReceiverId = _otherUserId
        });

        Assert.True(result.Succeeded);
        Assert.Equal("pending", result.Contact!.Status);
    }

    [Fact]
    public async Task SendRequest_ToSelf_ReturnsError()
    {
        var result = await _contactService.SendRequestAsync(new SendContactRequestParameters
        {
            RequesterId = _userId,
            ReceiverId = _userId
        });

        Assert.False(result.Succeeded);
        Assert.Contains("You cannot send a contact request to yourself.", result.Errors);
    }

    [Fact]
    public async Task SendRequest_AlreadyPending_ReturnsError()
    {
        await _contactService.SendRequestAsync(new SendContactRequestParameters
        {
            RequesterId = _userId, ReceiverId = _otherUserId
        });

        var result = await _contactService.SendRequestAsync(new SendContactRequestParameters
        {
            RequesterId = _userId, ReceiverId = _otherUserId
        });

        Assert.False(result.Succeeded);
        Assert.Contains("Contact request already exists.", result.Errors);
    }

    [Fact]
    public async Task SendRequest_ReversePending_ReturnsError()
    {
        await _contactService.SendRequestAsync(new SendContactRequestParameters
        {
            RequesterId = _otherUserId, ReceiverId = _userId
        });

        var result = await _contactService.SendRequestAsync(new SendContactRequestParameters
        {
            RequesterId = _userId, ReceiverId = _otherUserId
        });

        Assert.False(result.Succeeded);
        Assert.Contains("pending contact request already exists in the opposite direction", result.Errors.First());
    }

    [Fact]
    public async Task SendRequest_WhenBlocked_ReturnsError()
    {
        _dbContext.BlockedUsers.Add(new BlockedUser
        {
            Id = Guid.NewGuid(),
            UserId = _otherUserId,
            BlockedUserId = _userId,
            BlockedAt = DateTime.UtcNow,
            UnblockedAt = null
        });
        await _dbContext.SaveChangesAsync();

        var result = await _contactService.SendRequestAsync(new SendContactRequestParameters
        {
            RequesterId = _userId, ReceiverId = _otherUserId
        });

        Assert.False(result.Succeeded);
        Assert.Contains("Cannot send a contact request while a block exists.", result.Errors);
    }

    [Fact]
    public async Task Accept_ByReceiver_ReturnsAccepted()
    {
        var sendResult = await _contactService.SendRequestAsync(new SendContactRequestParameters
        {
            RequesterId = _userId, ReceiverId = _otherUserId
        });

        var acceptResult = await _contactService.AcceptAsync(new RespondToContactParameters
        {
            ContactId = sendResult.Contact!.Id,
            UserId = _otherUserId
        });

        Assert.True(acceptResult.Succeeded);
        Assert.Equal("accepted", acceptResult.Contact!.Status);
        Assert.NotNull(acceptResult.Contact.RespondedAt);
    }

    [Fact]
    public async Task Accept_ByRequester_ReturnsError()
    {
        var sendResult = await _contactService.SendRequestAsync(new SendContactRequestParameters
        {
            RequesterId = _userId, ReceiverId = _otherUserId
        });

        var acceptResult = await _contactService.AcceptAsync(new RespondToContactParameters
        {
            ContactId = sendResult.Contact!.Id,
            UserId = _userId
        });

        Assert.False(acceptResult.Succeeded);
    }

    [Fact]
    public async Task Reject_ByReceiver_ReturnsRejected()
    {
        var sendResult = await _contactService.SendRequestAsync(new SendContactRequestParameters
        {
            RequesterId = _userId, ReceiverId = _otherUserId
        });

        var rejectResult = await _contactService.RejectAsync(new RespondToContactParameters
        {
            ContactId = sendResult.Contact!.Id,
            UserId = _otherUserId
        });

        Assert.True(rejectResult.Succeeded);
        Assert.Equal("rejected", rejectResult.Contact!.Status);
    }

    [Fact]
    public async Task Cancel_ByRequester_ReturnsCancelled()
    {
        var sendResult = await _contactService.SendRequestAsync(new SendContactRequestParameters
        {
            RequesterId = _userId, ReceiverId = _otherUserId
        });

        var cancelResult = await _contactService.CancelAsync(new CancelContactRequestParameters
        {
            ContactId = sendResult.Contact!.Id,
            UserId = _userId
        });

        Assert.True(cancelResult.Succeeded);
        Assert.Equal("cancelled", cancelResult.Contact!.Status);
    }

    [Fact]
    public async Task Cancel_ByReceiver_ReturnsError()
    {
        var sendResult = await _contactService.SendRequestAsync(new SendContactRequestParameters
        {
            RequesterId = _userId, ReceiverId = _otherUserId
        });

        var cancelResult = await _contactService.CancelAsync(new CancelContactRequestParameters
        {
            ContactId = sendResult.Contact!.Id,
            UserId = _otherUserId
        });

        Assert.False(cancelResult.Succeeded);
    }

    [Fact]
    public async Task Remove_AcceptedContact_ReturnsCancelled()
    {
        var sendResult = await _contactService.SendRequestAsync(new SendContactRequestParameters
        {
            RequesterId = _userId, ReceiverId = _otherUserId
        });

        await _contactService.AcceptAsync(new RespondToContactParameters
        {
            ContactId = sendResult.Contact!.Id, UserId = _otherUserId
        });

        var removeResult = await _contactService.RemoveAsync(new RemoveContactParameters
        {
            ContactId = sendResult.Contact.Id, UserId = _userId
        });

        Assert.True(removeResult.Succeeded);
        Assert.Equal("cancelled", removeResult.Contact!.Status);
    }

    [Fact]
    public async Task Remove_PendingContact_ReturnsError()
    {
        var sendResult = await _contactService.SendRequestAsync(new SendContactRequestParameters
        {
            RequesterId = _userId, ReceiverId = _otherUserId
        });

        var removeResult = await _contactService.RemoveAsync(new RemoveContactParameters
        {
            ContactId = sendResult.Contact!.Id, UserId = _userId
        });

        Assert.False(removeResult.Succeeded);
        Assert.Contains("Only accepted contacts can be removed.", removeResult.Errors);
    }

    [Fact]
    public async Task GetMyContacts_FiltersByStatus()
    {
        var sendResult = await _contactService.SendRequestAsync(new SendContactRequestParameters
        {
            RequesterId = _userId, ReceiverId = _otherUserId
        });

        await _contactService.AcceptAsync(new RespondToContactParameters
        {
            ContactId = sendResult.Contact!.Id, UserId = _otherUserId
        });

        var accepted = await _contactService.GetMyContactsAsync(new GetMyContactsParameters
        {
            UserId = _userId, Status = "accepted"
        });

        var pending = await _contactService.GetMyContactsAsync(new GetMyContactsParameters
        {
            UserId = _userId, Status = "pending"
        });

        Assert.Single(accepted);
        Assert.Empty(pending);
    }

    public void Dispose() => _dbContext.Dispose();
}
