using ShipFleet.Core.Enums;

namespace ShipFleet.API.DTOs;

public class CreateShipDto
{
    public string ImoNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Flag { get; set; } = string.Empty;
    public ShipType Type { get; set; }
    public int YearBuilt { get; set; }
    public decimal GrossTonnage { get; set; }
    public decimal DeadweightTonnage { get; set; }
    public decimal LengthOverall { get; set; }
    public decimal Beam { get; set; }
    public decimal Draft { get; set; }
    public decimal MaxSpeedKnots { get; set; }
    public decimal FuelCapacityMT { get; set; }
    public FuelType PrimaryFuelType { get; set; }
    public string? Notes { get; set; }
}

public class UpdateShipDto
{
    public string? Flag { get; set; }
    public ShipStatus? Status { get; set; }
    public decimal? Draft { get; set; }
    public decimal? NauticalMilesTravelled { get; set; }
    public string? Notes { get; set; }
}

public class ShipResponseDto
{
    public Guid Id { get; set; }
    public string ImoNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Flag { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int YearBuilt { get; set; }
    public decimal GrossTonnage { get; set; }
    public decimal DeadweightTonnage { get; set; }
    public decimal LengthOverall { get; set; }
    public decimal Beam { get; set; }
    public decimal Draft { get; set; }
    public decimal MaxSpeedKnots { get; set; }
    public decimal FuelCapacityMT { get; set; }
    public string PrimaryFuelType { get; set; } = string.Empty;
    public decimal NauticalMilesTravelled { get; set; }
    public decimal? CurrentLatitude { get; set; }
    public decimal? CurrentLongitude { get; set; }
    public decimal? CurrentSpeedKnots { get; set; }
    public decimal? CurrentHeading { get; set; }
    public DateTime? LastPositionUpdate { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UpdateLocationDto
{
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public decimal? SpeedKnots { get; set; }
    public decimal? Heading { get; set; }
}