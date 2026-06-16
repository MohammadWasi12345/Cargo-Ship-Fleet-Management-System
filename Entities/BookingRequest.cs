using ShipFleet.Core.Enums;

namespace ShipFleet.Core.Entities;

public class BookingRequest : BaseEntity
{
    public Guid RequesterId { get; set; }
    public Guid ShipId { get; set; }
    public Guid DeparturePortId { get; set; }
    public Guid ArrivalPortId { get; set; }
    public DateTime PlannedDeparture { get; set; }
    public DateTime PlannedArrival { get; set; }
    public string Purpose { get; set; } = string.Empty;
    public decimal? CargoWeightMT { get; set; }
    public string? CargoDescription { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Pending;
    public Guid? ApproverId { get; set; }
    public string? RejectionReason { get; set; }
    public DateTime? ApprovedAt { get; set; }

    public User Requester { get; set; } = null!;
    public Ship Ship { get; set; } = null!;
    public User? Approver { get; set; }
    public Port DeparturePort { get; set; } = null!;
    public Port ArrivalPort { get; set; } = null!;
    public Voyage? Voyage { get; set; }
}