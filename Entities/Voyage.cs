using ShipFleet.Core.Enums;

namespace ShipFleet.Core.Entities;

public class Voyage : BaseEntity
{
    public string VoyageNumber { get; set; } = string.Empty;
    public Guid ShipId { get; set; }
    public Guid? CaptainId { get; set; }
    public Guid? BookingRequestId { get; set; }
    public Guid DeparturePortId { get; set; }
    public Guid ArrivalPortId { get; set; }
    public DateTime PlannedDeparture { get; set; }
    public DateTime PlannedArrival { get; set; }
    public DateTime? ActualDeparture { get; set; }
    public DateTime? ActualArrival { get; set; }
    public VoyageStatus Status { get; set; } = VoyageStatus.Planned;
    public decimal? DistanceNauticalMiles { get; set; }
    public decimal? FuelConsumedMT { get; set; }
    public decimal? CargoWeightMT { get; set; }
    public string? CargoDescription { get; set; }
    public string? Notes { get; set; }

    public Ship Ship { get; set; } = null!;
    public Captain? Captain { get; set; }
    public Port DeparturePort { get; set; } = null!;
    public Port ArrivalPort { get; set; } = null!;
    public BookingRequest? BookingRequest { get; set; }
}