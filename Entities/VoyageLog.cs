namespace ShipFleet.Core.Entities;

// Tamper-proof — no update/delete allowed
public class VoyageLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid VoyageId { get; set; }
    public Guid ShipId { get; set; }
    public string ShipName { get; set; } = string.Empty;
    public string ImoNumber { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? LoggedByName { get; set; }
    public Guid? LoggedByUserId { get; set; }
    public string? Latitude { get; set; }
    public string? Longitude { get; set; }
    public string Checksum { get; set; } = string.Empty;
    public DateTime EventTime { get; set; } = DateTime.UtcNow;
}