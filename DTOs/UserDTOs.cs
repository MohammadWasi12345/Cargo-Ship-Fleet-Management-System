using ShipFleet.Core.Enums;

namespace ShipFleet.API.DTOs;

public class UserResponseDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? Department { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Company { get; set; }
    public bool IsActive { get; set; }
    public bool IsApproved { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateUserDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Employee;
    public string? Department { get; set; }
    public string? PhoneNumber { get; set; }
}

public class UpdateUserRoleDto
{
    public UserRole Role { get; set; }
}