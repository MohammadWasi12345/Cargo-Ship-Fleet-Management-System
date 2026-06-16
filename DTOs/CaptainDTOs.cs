namespace ShipFleet.API.DTOs;

public class CreateCaptainDto
{
    public Guid UserId { get; set; }
    public string LicenseNumber { get; set; } = string.Empty;
    public string LicenseClass { get; set; } = string.Empty;
    public DateTime LicenseExpiry { get; set; }
    public int YearsExperience { get; set; }
    public string? Nationality { get; set; }
}

public class CaptainResponseDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public string LicenseClass { get; set; } = string.Empty;
    public DateTime LicenseExpiry { get; set; }
    public int YearsExperience { get; set; }
    public bool IsAvailable { get; set; }
    public string? Nationality { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AssignCaptainDto
{
    public Guid CaptainId { get; set; }
    public Guid ShipId { get; set; }
    public DateTime StartDate { get; set; }
    public string? Notes { get; set; }
}