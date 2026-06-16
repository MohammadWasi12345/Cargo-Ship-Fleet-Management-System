using ShipFleet.Core.Enums;

namespace ShipFleet.Core.Entities;

public class MaintenanceRecord : BaseEntity
{
    public Guid ShipId { get; set; }
    public Guid LoggedByUserId { get; set; }
    public MaintenanceType Type { get; set; }
    public DateTime ServiceDate { get; set; }
    public decimal Cost { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? ServiceProvider { get; set; }
    public string? PortOfMaintenance { get; set; }
    public decimal? NauticalMilesAtService { get; set; }
    public DateTime? NextServiceDate { get; set; }
    public bool IsCompleted { get; set; } = true;

    public Ship Ship { get; set; } = null!;
    public User LoggedBy { get; set; } = null!;
}