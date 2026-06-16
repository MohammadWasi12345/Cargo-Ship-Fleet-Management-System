namespace ShipFleet.Core.Entities;

public class ShipLocation : BaseEntity
{
    public Guid ShipId { get; set; }
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public decimal? SpeedKnots { get; set; }
    public decimal? HeadingDegrees { get; set; }
    public string? Status { get; set; }
    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;

    public Ship Ship { get; set; } = null!;
}