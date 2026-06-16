using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShipFleet.API.DTOs;
using ShipFleet.Core.Entities;
using ShipFleet.Core.Enums;
using ShipFleet.Core.Interfaces;

namespace ShipFleet.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,FleetManager")]
public class DashboardController : ControllerBase
{
    private readonly IRepository<Ship> _shipRepo;
    private readonly IRepository<Captain> _captainRepo;
    private readonly IRepository<BookingRequest> _bookingRepo;
    private readonly IRepository<FuelLog> _fuelRepo;
    private readonly IRepository<MaintenanceRecord> _maintenanceRepo;
    private readonly IRepository<Voyage> _voyageRepo;
    private readonly IRepository<Port> _portRepo;

    public DashboardController(
        IRepository<Ship> shipRepo,
        IRepository<Captain> captainRepo,
        IRepository<BookingRequest> bookingRepo,
        IRepository<FuelLog> fuelRepo,
        IRepository<MaintenanceRecord> maintenanceRepo,
        IRepository<Voyage> voyageRepo,
        IRepository<Port> portRepo)
    {
        _shipRepo = shipRepo;
        _captainRepo = captainRepo;
        _bookingRepo = bookingRepo;
        _fuelRepo = fuelRepo;
        _maintenanceRepo = maintenanceRepo;
        _voyageRepo = voyageRepo;
        _portRepo = portRepo;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var ships = (await _shipRepo.GetAllAsync()).ToList();
        var captains = (await _captainRepo.GetAllAsync()).ToList();
        var bookings = (await _bookingRepo.GetAllAsync()).ToList();
        var fuelLogs = (await _fuelRepo.GetAllAsync()).ToList();
        var maintenance = (await _maintenanceRepo.GetAllAsync()).ToList();
        var voyages = (await _voyageRepo.GetAllAsync()).ToList();
        var ports = (await _portRepo.GetAllAsync()).ToList();

        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1);

        var fuelThisMonth = fuelLogs
            .Where(f => f.Date >= startOfMonth)
            .Sum(f => f.QuantityMT * f.CostPerMT);

        var maintenanceThisMonth = maintenance
            .Where(m => m.ServiceDate >= startOfMonth)
            .Sum(m => m.Cost);

        var topCost = ships.Select(s => new ShipCostDto
        {
            ShipName = s.Name,
            ImoNumber = s.ImoNumber,
            FuelCost = fuelLogs.Where(f => f.ShipId == s.Id).Sum(f => f.QuantityMT * f.CostPerMT),
            MaintenanceCost = maintenance.Where(m => m.ShipId == s.Id).Sum(m => m.Cost),
            TotalCost = fuelLogs.Where(f => f.ShipId == s.Id).Sum(f => f.QuantityMT * f.CostPerMT) +
                       maintenance.Where(m => m.ShipId == s.Id).Sum(m => m.Cost)
        }).OrderByDescending(s => s.TotalCost).Take(5).ToList();

        var monthlyStats = Enumerable.Range(0, 6).Select(i =>
        {
            var month = now.AddMonths(-i);
            var start = new DateTime(month.Year, month.Month, 1);
            var end = start.AddMonths(1);
            return new MonthlyStatsDto
            {
                Month = month.ToString("MMM yyyy"),
                FuelCost = fuelLogs.Where(f => f.Date >= start && f.Date < end).Sum(f => f.QuantityMT * f.CostPerMT),
                MaintenanceCost = maintenance.Where(m => m.ServiceDate >= start && m.ServiceDate < end).Sum(m => m.Cost),
                TotalVoyages = voyages.Count(v => v.CreatedAt >= start && v.CreatedAt < end),
                FuelQuantityMT = fuelLogs.Where(f => f.Date >= start && f.Date < end).Sum(f => f.QuantityMT)
            };
        }).Reverse().ToList();

        var shipPositions = ships.Where(s => s.CurrentLatitude.HasValue).Select(s => new ShipLocationDto
        {
            ShipId = s.Id, ShipName = s.Name, ImoNumber = s.ImoNumber,
            Status = s.Status.ToString(), Type = s.Type.ToString(),
            Latitude = s.CurrentLatitude, Longitude = s.CurrentLongitude,
            SpeedKnots = s.CurrentSpeedKnots, Heading = s.CurrentHeading,
            LastUpdate = s.LastPositionUpdate
        }).ToList();

        return Ok(new DashboardStatsDto
        {
            TotalShips = ships.Count,
            ShipsUnderWay = ships.Count(s => s.Status == ShipStatus.UnderWay),
            ShipsInPort = ships.Count(s => s.Status == ShipStatus.InPort),
            ShipsAnchored = ships.Count(s => s.Status == ShipStatus.Anchored),
            ShipsUnderMaintenance = ships.Count(s => s.Status == ShipStatus.UnderMaintenance),
            TotalCaptains = captains.Count,
            AvailableCaptains = captains.Count(c => c.IsAvailable),
            TotalPorts = ports.Count,
            PendingBookings = bookings.Count(b => b.Status == BookingStatus.Pending),
            TotalVoyagesThisMonth = voyages.Count(v => v.CreatedAt >= startOfMonth),
            ActiveVoyages = voyages.Count(v => v.Status == VoyageStatus.UnderWay),
            TotalFuelCostThisMonth = fuelThisMonth,
            TotalMaintenanceCostThisMonth = maintenanceThisMonth,
            TotalCostThisMonth = fuelThisMonth + maintenanceThisMonth,
            TotalFuelQuantityThisMonth = fuelLogs.Where(f => f.Date >= startOfMonth).Sum(f => f.QuantityMT),
            TopCostShips = topCost,
            MonthlyStats = monthlyStats,
            ShipPositions = shipPositions
        });
    }
}