namespace ShipFleet.Core.Entities;

public class LoginAttempt : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public bool IsSuccess { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? FailureReason { get; set; }
    public DateTime AttemptedAt { get; set; } = DateTime.UtcNow;
    public bool IsLocked { get; set; } = false;
}