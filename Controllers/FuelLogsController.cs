using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShipFleet.API.DTOs;
using ShipFleet.Core.Entities;
using ShipFleet.Core.Interfaces;
using System.Security.Claims;

namespace ShipFleet.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FuelLogsController : ControllerBase
{
    private readonly IRepository<FuelLog> _fuelRepo;
    private readonly IRepository<Ship> _shipRepo;
    private readonly IRepository<User> _userRepo;

    public FuelLogsController(
        IRepository<FuelLog> fuelRepo,
        IRepository<Ship> shipRepo,
        IRepository<User> userRepo)
    {
        _fuelRepo = fuelRepo;
        _shipRepo = shipRepo;
        _userRepo = userRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var logs = await _fuelRepo.GetAllAsync();
        var result = new List<FuelLogResponseDto>();
        foreach (var f in logs.OrderByDescending(f => f.Date))
        {
            var ship = await _shipRepo.GetByIdAsync(f.ShipId);
            var user = await _userRepo.GetByIdAsync(f.LoggedByUserId);
            result.Add(new FuelLogResponseDto
            {
                Id = f.Id, ShipId = f.ShipId,
                ShipName = ship?.Name ?? "", ImoNumber = ship?.ImoNumber ?? "",
                Date = f.Date, QuantityMT = f.QuantityMT, CostPerMT = f.CostPerMT,
                TotalCost = f.QuantityMT * f.CostPerMT,
                NauticalMilesAtBunkering = f.NauticalMilesAtBunkering,
                FuelType = f.FuelType.ToString(),
                PortOfBunkering = f.PortOfBunkering, Supplier = f.Supplier,
                LoggedBy = user?.FullName ?? "", CreatedAt = f.CreatedAt
            });
        }
        return Ok(result);
    }

    [HttpGet("ship/{shipId}")]
    public async Task<IActionResult> GetByShip(Guid shipId)
    {
        var logs = await _fuelRepo.FindAsync(f => f.ShipId == shipId);
        var ship = await _shipRepo.GetByIdAsync(shipId);
        var result = logs.OrderByDescending(f => f.Date).Select(f => new FuelLogResponseDto
        {
            Id = f.Id, ShipId = f.ShipId,
            ShipName = ship?.Name ?? "", ImoNumber = ship?.ImoNumber ?? "",
            Date = f.Date, QuantityMT = f.QuantityMT, CostPerMT = f.CostPerMT,
            TotalCost = f.QuantityMT * f.CostPerMT,
            NauticalMilesAtBunkering = f.NauticalMilesAtBunkering,
            FuelType = f.FuelType.ToString(),
            PortOfBunkering = f.PortOfBunkering, Supplier = f.Supplier,
            CreatedAt = f.CreatedAt
        });
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,FleetManager,Captain")]
    public async Task<IActionResult> Create([FromBody] CreateFuelLogDto dto)
    {
        var ship = await _shipRepo.GetByIdAsync(dto.ShipId);
        if (ship == null) return NotFound(new { message = "Ship not found." });

        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var log = new FuelLog
        {
            ShipId = dto.ShipId,
            LoggedByUserId = userId,
            Date = dto.Date,
            QuantityMT = dto.QuantityMT,
            CostPerMT = dto.CostPerMT,
            NauticalMilesAtBunkering = dto.NauticalMilesAtBunkering,
            FuelType = dto.FuelType,
            PortOfBunkering = dto.PortOfBunkering,
            Supplier = dto.Supplier
        };

        await _fuelRepo.AddAsync(log);
        await _fuelRepo.SaveChangesAsync();
        return Ok(new { message = "Fuel log added.", id = log.Id });
    }
}