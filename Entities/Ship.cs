using ShipFleet.Core.Enums;

namespace ShipFleet.Core.Entities;

public class Ship : BaseEntity
{
    public string ImoNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Flag { get; set; } = string.Empty;
    public ShipType Type { get; set; }
    public ShipStatus Status { get; set; } = ShipStatus.InPort;
    public int YearBuilt { get; set; }
    public decimal GrossTonnage { get; set; }
    public decimal DeadweightTonnage { get; set; }
    public decimal LengthOverall { get; set; }
    public decimal Beam { get; set; }
    public decimal Draft { get; set; }
    public decimal MaxSpeedKnots { get; set; }
    public decimal FuelCapacityMT { get; set; }
    public FuelType PrimaryFuelType { get; set; }
    public decimal NauticalMilesTravelled { get; set; }
    public string? Notes { get; set; }

    // Live GPS
    public decimal? CurrentLatitude { get; set; }
    public decimal? CurrentLongitude { get; set; }
    public decimal? CurrentSpeedKnots { get; set; }
    public decimal? CurrentHeading { get; set; }
    public DateTime? LastPositionUpdate { get; set; }

    public ICollection<BookingRequest> BookingRequests { get; set; } = [];
    public ICollection<FuelLog> FuelLogs { get; set; } = [];
    public ICollection<MaintenanceRecord> MaintenanceRecords { get; set; } = [];
    public ICollection<CaptainAssignment> CaptainAssignments { get; set; } = [];
    public ICollection<Voyage> Voyages { get; set; } = [];
    public ICollection<ShipLocation> LocationHistory { get; set; } = [];
}