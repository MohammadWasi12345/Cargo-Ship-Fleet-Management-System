namespace ShipFleet.Core.Entities;

public class CaptainAssignment : BaseEntity
{
    public Guid ShipId { get; set; }
    public Guid CaptainId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsCurrent { get; set; } = true;
    public string? Notes { get; set; }

    public Ship Ship { get; set; } = null!;
    public Captain Captain { get; set; } = null!;
}