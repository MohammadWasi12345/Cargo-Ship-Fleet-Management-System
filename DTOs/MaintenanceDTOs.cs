using ShipFleet.Core.Enums;

namespace ShipFleet.API.DTOs;

public class CreateMaintenanceDto
{
    public Guid ShipId { get; set; }
    public MaintenanceType Type { get; set; }
    public DateTime ServiceDate { get; set; }
    public decimal Cost { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? ServiceProvider { get; set; }
    public string? PortOfMaintenance { get; set; }
    public decimal? NauticalMilesAtService { get; set; }
    public DateTime? NextServiceDate { get; set; }
}

public class MaintenanceResponseDto
{
    public Guid Id { get; set; }
    public Guid ShipId { get; set; }
    public string ShipName { get; set; } = string.Empty;
    public string ImoNumber { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public DateTime ServiceDate { get; set; }
    public decimal Cost { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? ServiceProvider { get; set; }
    public string? PortOfMaintenance { get; set; }
    public decimal? NauticalMilesAtService { get; set; }
    public DateTime? NextServiceDate { get; set; }
    public bool IsCompleted { get; set; }
    public string LoggedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}