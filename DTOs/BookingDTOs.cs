namespace ShipFleet.API.DTOs;

public class CreateBookingDto
{
    public Guid ShipId { get; set; }
    public Guid DeparturePortId { get; set; }
    public Guid ArrivalPortId { get; set; }
    public DateTime PlannedDeparture { get; set; }
    public DateTime PlannedArrival { get; set; }
    public string Purpose { get; set; } = string.Empty;
    public decimal? CargoWeightMT { get; set; }
    public string? CargoDescription { get; set; }
}

public class ApproveBookingDto
{
    public Guid CaptainId { get; set; }
}

public class RejectBookingDto
{
    public string RejectionReason { get; set; } = string.Empty;
}

public class BookingResponseDto
{
    public Guid Id { get; set; }
    public Guid ShipId { get; set; }
    public string ShipName { get; set; } = string.Empty;
    public string ImoNumber { get; set; } = string.Empty;
    public string RequesterName { get; set; } = string.Empty;
    public string DeparturePort { get; set; } = string.Empty;
    public string ArrivalPort { get; set; } = string.Empty;
    public DateTime PlannedDeparture { get; set; }
    public DateTime PlannedArrival { get; set; }
    public string Purpose { get; set; } = string.Empty;
    public decimal? CargoWeightMT { get; set; }
    public string? CargoDescription { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? RejectionReason { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}