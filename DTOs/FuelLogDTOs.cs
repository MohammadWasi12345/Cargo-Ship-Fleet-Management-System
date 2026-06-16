using ShipFleet.Core.Enums;

namespace ShipFleet.API.DTOs;

public class CreateFuelLogDto
{
    public Guid ShipId { get; set; }
    public DateTime Date { get; set; }
    public decimal QuantityMT { get; set; }
    public decimal CostPerMT { get; set; }
    public decimal NauticalMilesAtBunkering { get; set; }
    public FuelType FuelType { get; set; }
    public string? PortOfBunkering { get; set; }
    public string? Supplier { get; set; }
}

public class FuelLogResponseDto
{
    public Guid Id { get; set; }
    public Guid ShipId { get; set; }
    public string ShipName { get; set; } = string.Empty;
    public string ImoNumber { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public decimal QuantityMT { get; set; }
    public decimal CostPerMT { get; set; }
    public decimal TotalCost { get; set; }
    public decimal NauticalMilesAtBunkering { get; set; }
    public string FuelType { get; set; } = string.Empty;
    public string? PortOfBunkering { get; set; }
    public string? Supplier { get; set; }
    public string LoggedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}