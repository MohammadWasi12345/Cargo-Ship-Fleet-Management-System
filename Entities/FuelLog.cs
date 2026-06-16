using ShipFleet.Core.Enums;

namespace ShipFleet.Core.Entities;

public class FuelLog : BaseEntity
{
    public Guid ShipId { get; set; }
    public Guid LoggedByUserId { get; set; }
    public DateTime Date { get; set; }
    public decimal QuantityMT { get; set; }
    public decimal CostPerMT { get; set; }
    public decimal NauticalMilesAtBunkering { get; set; }
    public FuelType FuelType { get; set; }
    public string? PortOfBunkering { get; set; }
    public string? Supplier { get; set; }
    public decimal TotalCost => QuantityMT * CostPerMT;

    public Ship Ship { get; set; } = null!;
    public User LoggedBy { get; set; } = null!;
}