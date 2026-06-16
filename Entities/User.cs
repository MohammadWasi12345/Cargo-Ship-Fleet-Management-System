using ShipFleet.Core.Enums;

namespace ShipFleet.Core.Entities;

public class User : BaseEntity
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Employee;
    public string? Department { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Company { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsApproved { get; set; } = false;
    public DateTime? ApprovedAt { get; set; }
    public Guid? ApprovedBy { get; set; }

    public ICollection<BookingRequest> BookingRequests { get; set; } = [];
    public ICollection<BookingRequest> ApprovedRequests { get; set; } = [];
    public Captain? Captain { get; set; }
}