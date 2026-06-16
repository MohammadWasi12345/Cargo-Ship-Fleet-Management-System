namespace ShipFleet.API.DTOs;

public class CreateVoyageDto
{
    public Guid ShipId { get; set; }
    public Guid? CaptainId { get; set; }
    public Guid DeparturePortId { get; set; }
    public Guid ArrivalPortId { get; set; }
    public DateTime PlannedDeparture { get; set; }
    public DateTime PlannedArrival { get; set; }
    public decimal? CargoWeightMT { get; set; }
    public string? CargoDescription { get; set; }
    public decimal? DistanceNauticalMiles { get; set; }
    public string? Notes { get; set; }
}

public class VoyageResponseDto
{
    public Guid Id { get; set; }
    public string VoyageNumber { get; set; } = string.Empty;
    public Guid ShipId { get; set; }
    public string ShipName { get; set; } = string.Empty;
    public string ImoNumber { get; set; } = string.Empty;
    public string? CaptainName { get; set; }
    public string DeparturePort { get; set; } = string.Empty;
    public string ArrivalPort { get; set; } = string.Empty;
    public string DeparturePortCode { get; set; } = string.Empty;
    public string ArrivalPortCode { get; set; } = string.Empty;
    public DateTime PlannedDeparture { get; set; }
    public DateTime PlannedArrival { get; set; }
    public DateTime? ActualDeparture { get; set; }
    public DateTime? ActualArrival { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal? DistanceNauticalMiles { get; set; }
    public decimal? FuelConsumedMT { get; set; }
    public decimal? CargoWeightMT { get; set; }
    public string? CargoDescription { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}