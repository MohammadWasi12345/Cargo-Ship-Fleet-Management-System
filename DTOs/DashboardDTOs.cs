namespace ShipFleet.API.DTOs;

public class DashboardStatsDto
{
    public int TotalShips { get; set; }
    public int ShipsUnderWay { get; set; }
    public int ShipsInPort { get; set; }
    public int ShipsAnchored { get; set; }
    public int ShipsUnderMaintenance { get; set; }
    public int TotalCaptains { get; set; }
    public int AvailableCaptains { get; set; }
    public int TotalPorts { get; set; }
    public int PendingBookings { get; set; }
    public int TotalVoyagesThisMonth { get; set; }
    public int ActiveVoyages { get; set; }
    public decimal TotalFuelCostThisMonth { get; set; }
    public decimal TotalMaintenanceCostThisMonth { get; set; }
    public decimal TotalCostThisMonth { get; set; }
    public decimal TotalFuelQuantityThisMonth { get; set; }
    public List<ShipCostDto> TopCostShips { get; set; } = [];
    public List<MonthlyStatsDto> MonthlyStats { get; set; } = [];
    public List<ShipLocationDto> ShipPositions { get; set; } = [];
}

public class ShipCostDto
{
    public string ShipName { get; set; } = string.Empty;
    public string ImoNumber { get; set; } = string.Empty;
    public decimal FuelCost { get; set; }
    public decimal MaintenanceCost { get; set; }
    public decimal TotalCost { get; set; }
}

public class MonthlyStatsDto
{
    public string Month { get; set; } = string.Empty;
    public decimal FuelCost { get; set; }
    public decimal MaintenanceCost { get; set; }
    public int TotalVoyages { get; set; }
    public decimal FuelQuantityMT { get; set; }
}

public class ShipLocationDto
{
    public Guid ShipId { get; set; }
    public string ShipName { get; set; } = string.Empty;
    public string ImoNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public decimal? SpeedKnots { get; set; }
    public decimal? Heading { get; set; }
    public DateTime? LastUpdate { get; set; }
}