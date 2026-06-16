using ShipFleet.Core.Entities;
using ShipFleet.Core.Interfaces;

namespace ShipFleet.API.Services;

public class AuditService
{
    private readonly IRepository<AuditLog> _auditRepo;
    private readonly IRepository<LoginAttempt> _loginAttemptRepo;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuditService(
        IRepository<AuditLog> auditRepo,
        IRepository<LoginAttempt> loginAttemptRepo,
        IHttpContextAccessor httpContextAccessor)
    {
        _auditRepo = auditRepo;
        _loginAttemptRepo = loginAttemptRepo;
        _httpContextAccessor = httpContextAccessor;
    }

    private string GetIpAddress()
    {
        var context = _httpContextAccessor.HttpContext;
        return context?.Connection?.RemoteIpAddress?.ToString() ?? "Unknown";
    }

    private string GetUserAgent()
    {
        var context = _httpContextAccessor.HttpContext;
        return context?.Request?.Headers["User-Agent"].ToString() ?? "Unknown";
    }

    public async Task LogActionAsync(
        Guid? userId, string email, string role,
        string action, string entityType,
        string? entityId = null, string? oldValues = null,
        string? newValues = null, bool isSuccess = true,
        string? failureReason = null)
    {
        var log = new AuditLog
        {
            UserId = userId,
            UserEmail = email,
            UserRole = role,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            OldValues = oldValues,
            NewValues = newValues,
            IpAddress = GetIpAddress(),
            UserAgent = GetUserAgent(),
            IsSuccess = isSuccess,
            FailureReason = failureReason,
            Timestamp = DateTime.UtcNow
        };

        await _auditRepo.AddAsync(log);
        await _auditRepo.SaveChangesAsync();
    }

    public async Task LogLoginAttemptAsync(
        string email, bool isSuccess,
        string? failureReason = null)
    {
        var attempt = new LoginAttempt
        {
            Email = email.ToLower().Trim(),
            IsSuccess = isSuccess,
            IpAddress = GetIpAddress(),
            UserAgent = GetUserAgent(),
            FailureReason = failureReason,
            AttemptedAt = DateTime.UtcNow
        };

        await _loginAttemptRepo.AddAsync(attempt);
        await _loginAttemptRepo.SaveChangesAsync();
    }

    public async Task<bool> IsAccountLockedAsync(string email)
    {
        var lockoutWindow = DateTime.UtcNow.AddMinutes(-15);
        var recentFailures = await _loginAttemptRepo.FindAsync(
            a => a.Email == email.ToLower().Trim() &&
                 !a.IsSuccess &&
                 a.AttemptedAt >= lockoutWindow);

        // Lock after 5 failed attempts in 15 minutes
        return recentFailures.Count() >= 5;
    }

    public async Task<int> GetFailedAttemptsAsync(string email)
    {
        var lockoutWindow = DateTime.UtcNow.AddMinutes(-15);
        var failures = await _loginAttemptRepo.FindAsync(
            a => a.Email == email.ToLower().Trim() &&
                 !a.IsSuccess &&
                 a.AttemptedAt >= lockoutWindow);
        return failures.Count();
    }
}