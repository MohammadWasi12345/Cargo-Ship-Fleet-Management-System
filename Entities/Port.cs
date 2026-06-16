namespace ShipFleet.Core.Entities;

public class Port : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public string? TimeZone { get; set; }
    public string? Notes { get; set; }

    public ICollection<Voyage> DepartureVoyages { get; set; } = [];
    public ICollection<Voyage> ArrivalVoyages { get; set; } = [];
    public ICollection<BookingRequest> DepartureBookings { get; set; } = [];
    public ICollection<BookingRequest> ArrivalBookings { get; set; } = [];
}