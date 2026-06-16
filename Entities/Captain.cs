namespace ShipFleet.Core.Entities;

public class Captain : BaseEntity
{
    public Guid UserId { get; set; }
    public string LicenseNumber { get; set; } = string.Empty;
    public string LicenseClass { get; set; } = string.Empty;
    public DateTime LicenseExpiry { get; set; }
    public int YearsExperience { get; set; }
    public bool IsAvailable { get; set; } = true;
    public string? Nationality { get; set; }

    public User User { get; set; } = null!;
    public ICollection<CaptainAssignment> Assignments { get; set; } = [];
    public ICollection<Voyage> Voyages { get; set; } = [];
}